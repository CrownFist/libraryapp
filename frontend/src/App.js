import { useState } from 'react'
import NavBar from './components/NavBar'
import Notify from './components/Notify'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import FavouriteGenre from './components/FavouriteGenre'
import LoginForm from './components/LoginForm'
import SubNotify from './components/SubNotify'
import { Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useApolloClient, useSubscription } from '@apollo/client'
import { useEffect } from 'react'
import { ALL_BOOKS, BOOK_ADDED } from './services/queries'

// function that takes care of manipulating cache
export const updateCache = (cache, query, addedBook) => {
  // helper that is used to eliminate saving same book twice
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      //jos samanniminen kirja olemassa
      let k = item.title
      return seen.has(k) ? false : seen.add(k)
    })
  }
  cache.updateQuery(query, ({ allBooks }) => {
    return { allBooks: uniqByName(allBooks.concat(addedBook)) }
  })
}

const App = () => {
  // suosikkigenre tänne jotta voi passata NewBookille välimuistin
  // mahdollista päivitystä varten (jos genre mätsää).
  const [favoriteGenre, setFavoriteGenre] = useState(null)
  const [token, setToken] = useState(null)
  const navigate = useNavigate()
  const client = useApolloClient()
  const [errorMessage, setErrorMessage] = useState(null)
  const [subNotification, setSubNotification] = useState(null)

  const subNotify = (message) => {
    setSubNotification(message)
    setTimeout(() => {
      setSubNotification(null)
    }, 5000)
  }

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const addedBook = data.data.bookAdded
      console.log(addedBook)
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
      subNotify('New book added: ' + addedBook.title)
    },
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('libraryapp-user-token')
    if (storedToken) {
      setToken(storedToken)
    }
  }, [])

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  return (
    <div>
      <NavBar navigate={navigate} logout={logout} token={token}></NavBar>
      <Notify errorMessage={errorMessage} />
      <SubNotify message={subNotification} />
      <Routes>
        <Route path='/' element={<Authors token={token} />} />
        <Route path='/books' element={<Books />} />
        <Route
          path='/add'
          element={
            token ? (
              <NewBook setError={notify} favouriteGenre={favoriteGenre} />
            ) : (
              <LoginForm setToken={setToken} setError={notify} />
            )
          }
        />
        <Route
          path='/login'
          element={<LoginForm setToken={setToken} setError={notify} />}
        />
        <Route
          path='/favourite'
          element={
            token ? (
              <FavouriteGenre
                setError={notify}
                favoriteGenre={favoriteGenre}
                setFavoriteGenre={setFavoriteGenre}
              />
            ) : (
              <LoginForm setToken={setToken} setError={notify} />
            )
          }
        />
      </Routes>
    </div>
  )
}

export default App
