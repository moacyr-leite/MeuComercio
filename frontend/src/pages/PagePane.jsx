import React from 'react'

function PagePane({ children }) {
  return (
    <div className="page-pane">
      <div className="section-card">{children}</div>
    </div>
  )
}

export default PagePane
