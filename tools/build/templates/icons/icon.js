const svgParser = require('svgson')

function transformAttr(key, value, escape) {
  if ('stroke' === key && value !== 'none') {
    value = 'currentColor'
  }
  if ('fill' === key && value !== 'none') {
    value = 'currentColor'
  }
  // if (['stroke', 'fill'].includes(key)) {
  //   return
  // }

  return `${key}="${escape(value)}"`
}

function getViwBox(attributes) {
  if (attributes.viewBox) {
    return attributes.viewBox
  }
  if (attributes.width && attributes.height) {
    return `0 0 ${attributes.width} ${attributes.height}`
  }

  return '0 0 24 24'
}

module.exports = async (iconName, file) => {
  const source = await svgParser.parse(file)

  return {
    content: `import * as React from 'react'

/**
 * @description ${iconName} icon component.
 *
 * @component
 * @example
 * \`\`\`jsx
 * import { ${iconName} } from 'st17-react-icons/design-system-icons'
 *
 * <${iconName} />
 * \`\`\`
 */
  export const ${iconName} = React.forwardRef<SVGSVGElement, React.HTMLAttributes<SVGSVGElement>>((props, ref) => (
    <svg ref={ref} data-qa="${iconName}" viewBox="${getViwBox(source.attributes)}" fill="none" xmlns="${
      source.attributes.xmlns || 'http://www.w3.org/2000/svg'
    }" {...props}>
      ${svgParser.stringify(source.children, { transformAttr })}
    </svg>
  ))
  `,
    name: iconName,
    directory: '',
    extension: '.tsx',
  }
}
