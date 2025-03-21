import React, { useState, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import axios from "axios"
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {

  const [formData, setFormData] = useState({ email: "", password: "" })
  const { setUser } = useContext(AuthContext)

  const navigate = useNavigate()

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  function handleLogin(e) {

    e.preventDefault()
    console.log(formData)


    axios.post("http://resumelens-backend-env.eba-jepn5cmh.ap-south-1.elasticbeanstalk.com/api/auth/login", formData)
      .then((res) => {
        console.log("login response", res)
        if (res.status === 200) {
          localStorage.setItem("token", res.data.token);
          setUser({ token: res.data.token })
          navigate('/selection')
        }
      })
      .catch((err) => {
        if (err.response.status === 404)
          console.log("User not exists")
        else if (err.response.status === 400)
          console.log("User password mismatch")
        else
          console.log("Network Error")
      })
  }

  return (
    <div className="login-container">
      <form className="login-form">
        <div className="mb-3">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" name="email" onChange={handleChange} placeholder="Enter your email" />
        </div>
        <div className="mb-3">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" onChange={handleChange} placeholder="Enter your password" />
        </div>
        <button onClick={handleLogin} className="login-button">Login</button>
      </form>
    </div>

  )
}
