import React from 'react';
import { Link } from 'react-router-dom'; // To navigate between pages

function SideNavbar() {
    return (
        <div className="sidebar">
            <ul>
                <li>
                    <Link to="/">Dashboard</Link>
                </li>
                <li>
                    <Link to="/">Products</Link>
                </li>
                {/* Add more links if necessary */}
            </ul>
        </div>
    );
}

export default SideNavbar;
