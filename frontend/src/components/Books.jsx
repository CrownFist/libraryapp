import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_BOOKS_BY_GENRE } from '../services/queries'
import { useState } from 'react'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState(null)

  const allQueryResult = useQuery(ALL_BOOKS)

  const byBookResult = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre: selectedGenre },
  })

  //tietojen hakua odotellessa näytetään latausteksti
  if (allQueryResult.loading || byBookResult.loading) {
    return <div>loading books..</div>
  }

  // ei tarvitse suodattaa duplikaatteja kun käyttää Settiä
  let genres = new Set()

  // Painikkeiden genret asetetaan ALL_BOOKS queryn perusteella
  allQueryResult.data.allBooks.forEach((book) => {
    book.genres.forEach((genre) => {
      genres.add(genre)
    })
  })

  // muutetaan taulukoksi että voidaan iteroida .mapilla painikkeet näkyviin
  genres = Array.from(genres)

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th align='left'>author</th>
            <th>published</th>
          </tr>
          {selectedGenre
            ? byBookResult.data.allBooks.map((book) => (
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                  <td>{book.genres.join(', ')}</td>
                </tr>
              ))
            : allQueryResult.data.allBooks.map((book) => (
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                  <td>{book.genres.join(', ')}</td>
                </tr>
              ))}
        </tbody>
      </table>
      <div style={{ marginTop: '10px' }}>
        {genres
          ? genres.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                style={{ margin: '5px' }}
              >
                {genre}
              </button>
            ))
          : null}
        <button onClick={() => setSelectedGenre('')}>all genres</button>
      </div>
    </div>
  )
}

export default Books
