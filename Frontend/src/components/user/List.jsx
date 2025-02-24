import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserListPage() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    roles: [],
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        console.error("Received non-array data:", data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Error fetching users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Handle input changes for username, email, and password
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle role selection properly
  const handleRolesChange = (e) => {
    const selectedRoles = Array.from(e.target.selectedOptions, (option) => option.value);
    setNewUser((prev) => ({
      ...prev,
      roles: selectedRoles,
    }));
  };

  // Handle adding a new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email || !newUser.password) {
      toast.error("Please fill all required fields.");
      return;
    }

    const newUserData = { ...newUser };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify(newUserData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("User added successfully!");
        setNewUser({ username: "", email: "", password: "", roles: [] });
        setModalOpen(false);
        fetchUsers();
      } else {
        toast.error(result.message || "Error adding user");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Error adding user");
    }
  };

  // Handle editing an existing user
  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!newUser.username || !newUser.email) {
      toast.error("Please fill all required fields.");
      return;
    }

    const updatedUserData = {
      username: newUser.username,
      email: newUser.email,
      roles: newUser.roles,
    };

    if (newUser.password) {
      updatedUserData.password = newUser.password;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify(updatedUserData),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("User updated successfully!");
        setNewUser({ username: "", email: "", password: "", roles: [] });
        setModalOpen(false);
        setEditUser(null);
        fetchUsers();
      } else {
        toast.error(result.message || "Error updating user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Error updating user");
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setNewUser({ ...user, roles: user.roles.map((role) => role.name) });
    setEditUser(user);
    setModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteConfirmation = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${userToDelete.id}`, {
        method: "DELETE",
        headers: {
          "x-access-token": token,
        },
      });

      if (response.ok) {
        toast.success("User deleted successfully!");
        setDeleteModalOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        toast.error("Error deleting user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Users</h1>
      </header>

      <div className="dashboard-content">
        <button onClick={() => setModalOpen(true)} className="add-button">
          Add New User
        </button>

        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editUser ? "Edit User" : "Add New User"}</h2>
              <form onSubmit={editUser ? handleEditUser : handleAddUser}>
                <input type="text" name="username" placeholder="Username" value={newUser.username} onChange={handleInputChange} required />
                <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleInputChange} required />
                {!editUser && <input type="password" name="password" placeholder="Password" value={newUser.password} onChange={handleInputChange} required />}
                <select name="roles" value={newUser.roles} onChange={handleRolesChange} multiple>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  {/* <option value="moderator">Moderator</option> */}
                </select>
                <button type="submit">{editUser ? "Update User" : "Add User"}</button>
                <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        {deleteModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Are you sure you want to delete this user?</h2>
              <button onClick={handleDeleteUser}>Yes, Delete</button>
              <button onClick={() => setDeleteModalOpen(false)}>Cancel</button>
            </div>
          </div>
        )}

        {loading ? <p>Loading users...</p> : (
          <table>
            <thead>
              <tr><th>ID</th><th>Username</th><th>Email</th><th>Roles</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.roles.map(role => role.name).join(", ")}</td>
                  <td>
                    <button onClick={() => openEditModal(user)}>Edit</button>
                    <button onClick={() => openDeleteConfirmation(user)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>
      <ToastContainer />
    </div>
  );
}

export default UserListPage;
