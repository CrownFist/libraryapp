import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { ADD_BOOK, ALL_BOOKS, ALL_BOOKS_BY_GENRE } from '../services/queries'
import { updateCache } from '../App'

const NewBook = ({ setError, favouriteGenre }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [addNewBook] = useMutation(ADD_BOOK, {
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join('\n')
      setError(messages)
      console.log(messages)
    },
    update: (cache, response) => {
      const newBook = response.data.addBook
      //lisätään uusi kirja kaikki kirjat hakeneen queryn välimuistiin, jos ei ole jo.
      updateCache(cache, { query: ALL_BOOKS }, newBook)
      //jos lisättävän kirjan genre mätsää käyttäjän lempigenreen,
      //päivitettän myös suosikkinäkymän välimuisti
      if (newBook.genres.includes(favouriteGenre)) {
        cache.updateQuery(
          { query: ALL_BOOKS_BY_GENRE, variables: { genre: favouriteGenre } },
          (data) => {
            if (data) {
              return { allBooks: data.allBooks.concat(newBook) }
            } else {
              return { allBooks: [newBook] }
            }
          }
        )
      }
    },
  })

  const submit = async (event) => {
    event.preventDefault()

    addNewBook({ variables: { title, published, genres, author } })
    console.log('adding book...')

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  const handlePublished = (event) => {
    //jos kenttä tyhjätään lisäyksen jälkeen, asetetaan tilaan ''
    const published = parseInt(event.target.value)
    if (event.target.value === '') {
      setPublished('')
    } else {
      setPublished(published)
    }
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input type='number' value={published} onChange={handlePublished} />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type='button'>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type='submit'>create book</button>
      </form>
    </div>
  )
}

export default NewBook
