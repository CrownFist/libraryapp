const SubNotify = ({ message }) => {
  if (!message) {
    return null
  }
  return <div style={{ color: 'green' }}>{message}</div>
}

export default SubNotify
