import { useQuery } from '@apollo/client'
import React, { useEffect } from 'react'
import { MY_FAVORITE_GENRE, ALL_BOOKS_BY_GENRE } from '../services/queries'

const FavouriteGenre = ({ setError, favoriteGenre, setFavoriteGenre }) => {
  const favouriteResult = useQuery(MY_FAVORITE_GENRE)
  const byBookResult = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: { genre: favoriteGenre },
  })

  useEffect(() => {
    if (favouriteResult.data) {
      setFavoriteGenre(favouriteResult.data.me.favoriteGenre)
    }
  })

  if (favouriteResult.loading || byBookResult.loading) {
    return <div>Loading...</div>
  }

  // console.log(byBookResult)

  return (
    <>
      <div>
        <h2>Recommendations</h2>
      </div>
      {byBookResult && favouriteResult ? (
        <>
          <div>
            books in your favourite genre <strong>{favoriteGenre}</strong>
          </div>
          <table>
            <tbody>
              <tr>
                <th></th>
                <th align='left'>author</th>
                <th>published</th>
                <th align='left' style={{ paddingLeft: '10px' }}>
                  genres
                </th>
              </tr>
              {byBookResult.data.allBooks.map((book) => (
                <tr key={book.title}>
                  <td>{book.title}</td>
                  <td>{book.author.name}</td>
                  <td>{book.published}</td>
                  <td style={{ paddingLeft: '10px' }}>
                    {book.genres.join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <div>Loading recommendations...</div>
      )}
    </>
  )
}

export default FavouriteGenre
