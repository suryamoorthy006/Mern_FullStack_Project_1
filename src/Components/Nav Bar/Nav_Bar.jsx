import React from 'react'
import './Nav_Bar.css'
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded'
function Nav_Bar({ onLogout }) {
  return (
    <div className="Navcontainer">
        <div className="Nav-left">
          <h1 className="nav_icon"><MenuBookRoundedIcon style={{ fontSize: 40 }} /></h1>
            <ul>
                <li>Home</li>
                <li>About</li>
                <li>Contact</li>
                <li>Fav</li>
            </ul>
      </div>
      <div className="Nav-right">
        <input type="text" placeholder='Search' className="Nav-input" />
        <button className="Nav-btn" type="button" onClick={onLogout}>Logout</button>
      </div>
    </div>
  )
}
export default Nav_Bar