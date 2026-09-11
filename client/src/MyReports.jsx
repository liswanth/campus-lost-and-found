import { useEffect, useState } from 'react'

const emptyForm = {
  itemName: '',
  category: '',
  description: '',
  location: '',
  date: '',
  contact: ''
}

function MyReports({ token }) {
  const [lostItems, setLostItems] = useState([])
  const [foundItems, setFoundItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [busyId, setBusyId] = useState(null)

  const fetchReports = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/my-reports', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load reports')
      }

      setLostItems(data.lostItems || [])
      setFoundItems(data.foundItems || [])
    } catch (err) {
      console.error('My Reports Error:', err)
      setError(err.message || 'Could not load your reports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) fetchReports()
  }, [token])

  const startEdit = (item, type) => {
    setEditing({ id: item._id, type })
    setEditForm({
      itemName: item.itemName || '',
      category: item.category || '',
      description: item.description || '',
      location: item.location || '',
      date: item.date || '',
      contact: item.contact || ''
    })
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditForm(emptyForm)
  }

  const saveEdit = async () => {
    if (!editing) return

    setBusyId(editing.id)

    try {
      const response = await fetch(
        `http://localhost:5000/api/${editing.type}-items/${editing.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(editForm)
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update report')
      }

      if (editing.type === 'lost') {
        setLostItems((items) =>
          items.map((item) => item._id === editing.id ? data.item : item)
        )
      } else {
        setFoundItems((items) =>
          items.map((item) => item._id === editing.id ? data.item : item)
        )
      }

      cancelEdit()
    } catch (err) {
      console.error('Update Error:', err)
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const deleteItem = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return

    setBusyId(id)

    try {
      const response = await fetch(
        `http://localhost:5000/api/${type}-items/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete report')
      }

      if (type === 'lost') {
        setLostItems((items) => items.filter((item) => item._id !== id))
      } else {
        setFoundItems((items) => items.filter((item) => item._id !== id))
      }
    } catch (err) {
      console.error('Delete Error:', err)
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const markAsFound = async (id) => {
    if (!window.confirm('Mark this lost item as found?')) return

    setBusyId(id)

    try {
      const response = await fetch(
        `http://localhost:5000/api/lost-items/${id}/mark-found`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to mark item as found')
      }

      setLostItems((items) =>
        items.map((item) => item._id === id ? data.item : item)
      )
    } catch (err) {
      console.error('Mark Found Error:', err)
      alert(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleEditChange = (e) => {
    setEditForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }))
  }

  const editFormView = () => (
    <div className="edit-report-form">
      <h4>✏️ Edit Report</h4>

      <div className="edit-form-grid">
        <div className="edit-input-group">
          <label>Item Name</label>
          <input name="itemName" value={editForm.itemName} onChange={handleEditChange} />
        </div>

        <div className="edit-input-group">
          <label>Category</label>
          <select name="category" value={editForm.category} onChange={handleEditChange}>
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Personal">Personal</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="edit-input-group edit-full-width">
          <label>Description</label>
          <textarea name="description" rows="4" value={editForm.description} onChange={handleEditChange} />
        </div>

        <div className="edit-input-group">
          <label>Location</label>
          <input name="location" value={editForm.location} onChange={handleEditChange} />
        </div>

        <div className="edit-input-group">
          <label>Date</label>
          <input type="date" name="date" value={editForm.date} onChange={handleEditChange} />
        </div>

        <div className="edit-input-group">
          <label>Contact</label>
          <input name="contact" value={editForm.contact} onChange={handleEditChange} />
        </div>

        <div className="edit-form-actions">
          <button className="save-edit-btn" onClick={saveEdit} disabled={busyId === editing?.id} type="button">
            {busyId === editing?.id ? 'Saving...' : '💾 Save Changes'}
          </button>
          <button className="cancel-edit-btn" onClick={cancelEdit} type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  const ReportCard = ({ item, type }) => {
    const isEditing = editing?.id === item._id

    if (isEditing) {
      return <div className="my-report-card">{editFormView()}</div>
    }

    const isLost = type === 'lost'

    return (
      <article className="my-report-card">
        {item.imageUrl && (
          <img className="my-report-image" src={item.imageUrl} alt={item.itemName} />
        )}

        <div className="report-card-top">
          <span className={`report-type ${isLost && item.status !== 'Found' ? 'lost-type' : 'found-type'}`}>
            {isLost && item.status !== 'Found' ? 'LOST' : 'FOUND'}
          </span>
          <span className="report-category">{item.category}</span>
        </div>

        <h4>{item.itemName}</h4>
        <p className="report-description">{item.description}</p>

        <div className="report-details">
          <p>📍 <strong>Location:</strong> {item.location}</p>
          <p>📅 <strong>Date:</strong> {item.date}</p>
          <p>📞 <strong>Contact:</strong> {item.contact}</p>
        </div>

        <div className="report-actions">
          <button className="edit-btn" onClick={() => startEdit(item, type)} type="button">
            ✏️ Edit
          </button>

          <button
            className="delete-btn"
            onClick={() => deleteItem(item._id, type)}
            disabled={busyId === item._id}
            type="button"
          >
            {busyId === item._id ? 'Working...' : '🗑️ Delete'}
          </button>

          {isLost && (
            <button
              className="found-btn"
              onClick={() => markAsFound(item._id)}
              disabled={item.status === 'Found' || busyId === item._id}
              type="button"
            >
              {item.status === 'Found' ? '✅ Already Found' : '✅ Mark Found'}
            </button>
          )}
        </div>
      </article>
    )
  }

  if (loading) {
    return (
      <section className="my-reports-section">
        <div className="my-reports-container">
          <div className="empty-items"><div className="empty-icon">⏳</div><h3>Loading your reports...</h3></div>
        </div>
      </section>
    )
  }

  return (
    <section className="my-reports-section">
      <div className="my-reports-container">
        <div className="my-reports-header">
          <p className="section-label">ACCOUNT</p>
          <h2>📋 My Reports</h2>
          <p>View, edit, delete and update the reports you created.</p>
        </div>

        {error && (
          <div className="empty-items error-box">
            <h3>Unable to load reports</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchReports} type="button">Try Again</button>
          </div>
        )}

        <div className="reports-group">
          <h3>🔍 My Lost Reports ({lostItems.length})</h3>
          {lostItems.length === 0 ? (
            <div className="no-reports">You have no lost reports.</div>
          ) : (
            <div className="reports-grid">
              {lostItems.map((item) => <ReportCard key={item._id} item={item} type="lost" />)}
            </div>
          )}
        </div>

        <div className="reports-group">
          <h3>📦 My Found Reports ({foundItems.length})</h3>
          {foundItems.length === 0 ? (
            <div className="no-reports">You have no found reports.</div>
          ) : (
            <div className="reports-grid">
              {foundItems.map((item) => <ReportCard key={item._id} item={item} type="found" />)}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default MyReports
