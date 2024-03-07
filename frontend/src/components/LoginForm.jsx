import { useState, useEffect } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN } from '../services/queries'
import { useNavigate } from 'react-router-dom'

const LoginForm = ({ setError, setToken }) => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join('\n')
      setError(messages)
    },
  })

  useEffect(() => {
    if (result.data) {
      // haetaan token queryn tuloksesta ja asetetaan localstorageen
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('libraryapp-user-token', token)
      navigate('/')
    }
  }, [result.data])

  const submit = async (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
    setPassword('')
    setUsername('')
  }

  return (
    <div style={{ paddingTop: '15px' }}>
      <form onSubmit={submit}>
        <div>
          username{' '}
          <input
            value={username}
            onChange={({ target }) => setUsername(target.value)}
          />
        </div>
        <div>
          password{' '}
          <input
            type='password'
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            autoComplete='on'
          />
        </div>
        <button type='submit'>login</button>
      </form>
    </div>
  )
}

export default LoginForm
