export function GlitchText({ as: Tag = 'span', text, className = '', ...rest }) {
  return (
    <Tag className={`glitch-text ${className}`.trim()} data-text={text} {...rest}>
      {text}
    </Tag>
  )
}
