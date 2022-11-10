#!/usr/bin/env node
'use strict'

const path = require('path')
const fs = require('fs/promises')
const fse = require('fs-extra')
const _ = require('lodash')
const prettier = require('prettier')
const { ESLint } = require('eslint')
const { optimize } = require('svgo')
// const svgParser = require('svgson')

const iconTemplate = require('./templates/icons/icon')
const storiesTemplate = require('./templates/icons/stories')

const packagesPath = path.resolve(__dirname, '../../src')
const svgPath = path.resolve(packagesPath, 'svg')
const destPath = path.resolve(packagesPath, 'generated')
const indexPath = path.join(packagesPath, 'index.ts')
const storiesPath = path.join(packagesPath, 'stories')

const fileHeader = `// This is a generated file. DO NOT modify directly.\n\n`

// prettier format
async function formatFile(file) {
  const prettierConfig = await prettier.resolveConfig(__dirname)

  return prettier.format(file, {
    ...prettierConfig,
  })
}

async function getDirectoriesPaths() {
  const directoriesNames = (await fs.readdir(svgPath, {withFileTypes: true}))
    .filter(entity => entity.isDirectory())
    .map(directory => directory.name)

  return directoriesNames.map(name => `${svgPath}/${name}`)
}

async function getDirectoriesWithIcons(directoriesPaths) {
  const iconsInDirectories = []

  for(const svgDirectoryPath of directoriesPaths) {
    const icons = await getIconsFromDirectory(svgDirectoryPath)
    const directoryPath = svgDirectoryPath.split('/')
    iconsInDirectories.push({name: directoryPath[directoryPath.length - 1], icons})
  }
  return iconsInDirectories
}

async function getIconsFromDirectory(directoryName) {
  const icons = new Map()

  const files = await fs.readdir(directoryName)

  for (const file of files) {
    const filePath = [directoryName, file].join('/')
    const parsedFilePath = path.parse(file)

    const name = _.startCase(`${parsedFilePath.name}`).replace(/ /g, '')

    if (!icons.has(name)) {
      icons.set(name, filePath)
    } else {
      console.error(`❗️ Duplicate icon name for \`${file}\` will be ignored`)
    }
  }

  return icons
}

// make icon jsx file
async function makeIcon([name, path]) {
  const iconDestPath = [destPath, `${name}.tsx`].join('/')
  const source = await fs.readFile(path, { encoding: 'utf8' })
  const { data } = optimize(source, {
    plugins: [{
      name: 'preset-default',
      // params: {
      //   overrides: {
      //     cleanupIDs : {
      //       remove: true,
      //       minify: false
      //     },
      //   },
      // },
    }]
  })
  const { content } = await iconTemplate(name, data)
  const formattedContent = await formatFile(content)

  return fs.writeFile(iconDestPath, formattedContent)
}

// make exports
async function makeExports(iconsNames) {
  let iconsExport = `${fileHeader}/* Start generated icons */
    ${iconsNames.map((name) => `export { ${name} } from './generated/${name}'`).join('\n')}
    /* End generated icons */
  `

  iconsExport = await formatFile(iconsExport)

  return fs.writeFile(indexPath, iconsExport)
}

// make icons stories
async function makeStories(directories) {
  const { content, name } = await storiesTemplate(directories)
  const formattedContent = await formatFile(content)

  return fs.writeFile(`${storiesPath}/${name}`, formattedContent)
}

async function build() {
  const promises = []

  const directoriesPaths = await getDirectoriesPaths()

  const directories = await getDirectoriesWithIcons(directoriesPaths)
  let iconsInDirectories = directories.reduce((icons, directory) => [...icons, directory.icons], [])

  for (const icons of iconsInDirectories){
    for (let icon of icons) {
      promises.push(makeIcon(icon))
    }
  }

  let iconsNames = iconsInDirectories.reduce((names, iconsInDirectory) => [...names, ...iconsInDirectory.keys()], [])

  promises.push(makeExports(iconsNames))
  promises.push(makeStories(directories))

  return Promise.all(promises)
}

async function main() {
  await fse.emptyDir(destPath)
  await fse.emptyDir(storiesPath)

  await build()

}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
