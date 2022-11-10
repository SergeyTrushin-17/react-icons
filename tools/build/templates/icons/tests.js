const _ = require('lodash')

module.exports = async iconsNames => {
  return {
    content: `import * as React from 'react'
import { render, screen } from '@testing-library/react'

import { ${iconsNames.map((name) => name).join(', ')} } from '..'

${iconsNames.map(
  (name) => `
describe('${name}', () => {
  test('should render correctly with no props', () => {
    render(<${name} />)

    const component = screen.getByTestId('${name}')

    // expect(component).toMatchSnapshot()
    expect(component).toHaveAttribute('viewBox')
    expect(component).toHaveAttribute('xmlns')
    expect(component).toHaveAttribute('fill', 'none')
    expect(component).not.toHaveAttribute('stroke')
  })

  test('should render correctly with attributes', () => {
    render(<${name} id="test-id" className="test-class" />)

    const component = screen.getByTestId('${name}')

    // expect(component).toMatchSnapshot()
    expect(component).toHaveAttribute('id', 'test-id')
    expect(component).toHaveClass('test-class')
  })
})`
)}
`,
    name: 'Icons.test.tsx',
    directory: '',
    extension: '.tsx',
  }
}
