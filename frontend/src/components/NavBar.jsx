import React from 'react'

const NavBar = ({ navigate, logout, token }) => {
  return (
    <div>
      <button onClick={() => navigate('/')}>authors</button>
      <button onClick={() => navigate('/books')}>books</button>
      {token ? (
        <>
          <button onClick={() => navigate('/add')}>add book</button>
          <button onClick={() => navigate('/favourite')}>recommended</button>
          <button onClick={logout}>logout</button>
        </>
      ) : (
        <button onClick={() => navigate('/login')}>login</button>
      )}
    </div>
  )
}

export default NavBar
