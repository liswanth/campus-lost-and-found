import { useRef, useState } from 'react'

const emptyForm = {
  itemName: '',
  category: '',
  description: '',
  location: '',
  date: '',
  contact: ''
}

function FoundItemForm({ token }) {
  const [formData, setFormData] = useState(emptyForm)
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const fileRef = useRef(null)

  const handleChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value
    }))
  }

  const handleImage = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be smaller than 5 MB.')
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImage(null)
    setPreview('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      alert('Please login first!')
      return
    }

    setLoading(true)

    try {
      const body = new FormData()

      Object.entries(formData).forEach(([key, value]) => {
        body.append(key, value)
      })

      if (image) {
        body.append('image', image)
      }

      const response = await fetch('http://localhost:5000/api/found-items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to report found item')
      }

      alert('Found item reported successfully! 🎉')
      setFormData(emptyForm)
      removeImage()
    } catch (error) {
      console.error('Found Item Error:', error)
      alert(error.message || 'Cannot connect to the backend server!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="form-section found-form-section">
      <div className="form-container">
        <div className="form-title-row">
          <div className="form-icon">📦</div>
          <div>
            <p className="section-label">FOUND REPORT</p>
            <h2>Report Found Item</h2>
            <p>Help the owner identify and safely recover their item.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Item Name</label>
              <input name="itemName" placeholder="Example: Black Backpack" value={formData.itemName} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Documents">Documents</option>
                <option value="Personal">Personal</option>
                <option value="Books">Books</option>
                <option value="Clothing">Clothing</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="field full">
              <label>Description</label>
              <textarea name="description" rows="4" placeholder="Color, brand, model, unique marks..." value={formData.description} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Found Location</label>
              <input name="location" placeholder="Example: Library" value={formData.location} onChange={handleChange} required />
            </div>

            <div className="field">
              <label>Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required />
            </div>

            <div className="field full">
              <label>Contact</label>
              <input name="contact" placeholder="Phone number or email" value={formData.contact} onChange={handleChange} required />
            </div>

            <div className="field full">
              <label>Item Photo <span className="optional">(optional)</span></label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="file-input" />
              {preview && (
                <div className="image-preview">
                  <img src={preview} alt="Found item preview" />
                  <button type="button" onClick={removeImage}>Remove photo</button>
                </div>
              )}
            </div>
          </div>

          <button className="submit-form-btn" type="submit" disabled={loading}>
            {loading ? 'Uploading & Saving...' : '📦 Report Found Item'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default FoundItemForm
