import { useState } from 'react'
import { ALL_AUTHORS, UPDATE_AUTHOR } from '../services/queries'
import { useQuery, useMutation } from '@apollo/client'

const Authors = ({ token }) => {
  const [authorToBeUpdated, setAuthorToBeUpdated] = useState('Select...')
  const [birthYear, setBirthYear] = useState('')

  const allAuthorResult = useQuery(ALL_AUTHORS)

  const [updateAuthor, updateAuthorResult] = useMutation(UPDATE_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  })

  if (updateAuthorResult) {
    console.log(updateAuthorResult)
  }

  if (allAuthorResult.loading) {
    return <div>loading...</div>
  }

  const handleAuthorSelection = (event) => {
    setAuthorToBeUpdated(event.target.value)
    console.log(authorToBeUpdated)
  }
  const handleBirthYearChange = (event) => {
    //jos syöte tyhjätää, asetetaan tilaan ''
    const birtYear = parseInt(event.target.value)
    if (birtYear === '') {
      setBirthYear('')
    } else {
      setBirthYear(birtYear)
    }
  }
  const handleBirthYearSubmit = async (event) => {
    event.preventDefault()
    const yearInNumber = parseInt(birthYear)

    updateAuthor({
      variables: { name: authorToBeUpdated, setBornTo: yearInNumber },
    })
    setBirthYear('')
  }
  console.log(allAuthorResult.data)

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {allAuthorResult.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {token ? (
        <>
          <h3>Set birthyear</h3>
          <form onSubmit={handleBirthYearSubmit}>
            <label>
              {' '}
              <select
                value={authorToBeUpdated}
                onChange={handleAuthorSelection}
              >
                <option key={authorToBeUpdated}> {authorToBeUpdated}</option>
                {allAuthorResult.data.allAuthors.map((a) => (
                  <option key={a.name} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <label>
                born
                <input
                  type='number'
                  value={birthYear}
                  onChange={handleBirthYearChange}
                ></input>
              </label>
            </div>
            <button type='submit'>update author</button>
          </form>
        </>
      ) : null}
    </div>
  )
}

export default Authors
