const _ = require('lodash')

module.exports = async directories => {
  let iconsInDirectory = directories.reduce((icons, directory) => [...icons, directory.icons], [])
  let iconsNames = iconsInDirectory.reduce((names, icons) => [...names, ...Array.from(icons.keys())], [])

  return {
    content: `import * as React from 'react'
import { Story, Meta } from '@storybook/react'
import { Title, Subtitle, Stories } from '@storybook/addon-docs'

import { ${iconsNames.map((name) => name).join(', ')} } from '..'

export default {
  title: 'Foundations/Icons',
  parameters: {
    componentSubtitle: 'Our amazing icons.',
    docs: {
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Stories includePrimary/>
        </>
      ),
    },
  },
} as Meta

const rowStyles: React.CSSProperties = { display: 'flex', width: '100%', flexFlow: 'row wrap' }
const colStyles: React.CSSProperties = { display: 'block',  minHeight: '1px', textAlign: 'center', flex: \`0 0 ${(2 / 12) * 100}%\`, maxWidth: \`${(2 / 12) * 100}%\`, paddingTop: '24px', paddingBottom: '24px' }
const iconStyles: React.CSSProperties = { width: '40px', height: '40px', display: 'inline-flex', flexShrink: 0 }
const textStyles: React.CSSProperties = { color: '#636F7D', marginTop: '10px', fontSize: '10px', fontFamily: 'Helvetica' }
${directories.map(directory => `
export const ${directory.name}: Story = () => (
  <div style={rowStyles}>
    ${Array.from(directory.icons.keys())
      .map(
        (icon) => `
  <div style={colStyles}>
    <div style={iconStyles}>
      <${icon} />
    </div>
    <div style={textStyles}>
      ${icon}
    </div>
  </div>
      `
      )
      .join('\n')}
  </div>
)`).join('\n')}
`,
    name: 'Icons.stories.tsx',
    directory: '',
    extension: '.tsx',
  }
}
