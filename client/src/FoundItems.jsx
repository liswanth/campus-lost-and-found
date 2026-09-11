import { useEffect, useState } from 'react'

function FoundItems() {
  const [foundItems, setFoundItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchFoundItems = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/found-items')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load found items')
      }

      setFoundItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Found Items Error:', err)
      setError('Cannot load found items. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFoundItems()
  }, [])

  const filteredItems = foundItems.filter((item) => {
    const searchText = search.trim().toLowerCase()

    const matchesSearch =
      !searchText ||
      [item.itemName, item.description, item.location]
        .some((value) =>
          String(value || '').toLowerCase().includes(searchText)
        )

    const matchesCategory =
      category === 'All' || item.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <section className="found-items-section">
      <div className="items-content">
        <div className="section-heading">
          <p className="section-label">FOUND ITEMS</p>
          <h2>📦 Items Reported Found</h2>
          <p>Browse belongings that have already been found on campus.</p>
        </div>

        <div className="search-filter-container">
          <div className="search-box">
            <span>🔎</span>
            <input
              type="text"
              placeholder="Search item, description or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Documents">Documents</option>
            <option value="Personal">Personal</option>
            <option value="Books">Books</option>
            <option value="Clothing">Clothing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="result-count">
          Showing <strong>{filteredItems.length}</strong> of {foundItems.length} items
        </div>

        {loading ? (
          <div className="empty-items">
            <div className="empty-icon">⏳</div>
            <h3>Loading Found Items...</h3>
          </div>
        ) : error ? (
          <div className="empty-items error-box">
            <div className="empty-icon">⚠️</div>
            <h3>Unable to Load Items</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchFoundItems} type="button">
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-items">
            <div className="empty-icon">📭</div>
            <h3>No Found Items</h3>
            <p>Try another search or category.</p>
          </div>
        ) : (
          <div className="found-items-container">
            {filteredItems.map((item) => (
              <article className="found-item-card" key={item._id}>
                {item.imageUrl ? (
                  <img className="item-image" src={item.imageUrl} alt={item.itemName} />
                ) : (
                  <div className="item-image-placeholder">📦</div>
                )}

                <div className="found-card-body">
                  <div className="found-card-top">
                    <div className="found-item-symbol">📦</div>
                    <span className="found-badge">FOUND</span>
                  </div>

                  <h3>{item.itemName}</h3>
                  <span className="found-category">{item.category}</span>
                  <p className="found-description">{item.description}</p>

                  <div className="found-info">
                    <div className="info-row"><span>📍</span><div><small>Found Location</small><strong>{item.location}</strong></div></div>
                    <div className="info-row"><span>📅</span><div><small>Date</small><strong>{item.date}</strong></div></div>
                    <div className="info-row"><span>📞</span><div><small>Contact</small><strong>{item.contact}</strong></div></div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default FoundItems
