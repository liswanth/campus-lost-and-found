import { useEffect, useState } from 'react'

function LostItems() {
  const [lostItems, setLostItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [matchingId, setMatchingId] = useState(null)
  const [matches, setMatches] = useState({})
  const [openMatchId, setOpenMatchId] = useState(null)

  const fetchLostItems = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/lost-items')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to load lost items')
      }

      setLostItems(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Lost Items Error:', err)
      setError('Cannot load lost items. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLostItems()
  }, [])

  const findMatches = async (id) => {
    if (openMatchId === id) {
      setOpenMatchId(null)
      return
    }

    setMatchingId(id)

    try {
      const response = await fetch(
        `http://localhost:5000/api/lost-items/${id}/matches`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not find matches')
      }

      setMatches((previous) => ({
        ...previous,
        [id]: data.matches || []
      }))
      setOpenMatchId(id)
    } catch (err) {
      console.error('Matching Error:', err)
      alert(err.message || 'Could not find possible matches.')
    } finally {
      setMatchingId(null)
    }
  }

  const filteredItems = lostItems.filter((item) => {
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
    <section className="items-section">
      <div className="items-content">
        <div className="section-heading">
          <p className="section-label">LOST ITEMS</p>
          <h2>🔍 Items Reported Lost</h2>
          <p>Search reports and check possible matches with found items.</p>
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
          Showing <strong>{filteredItems.length}</strong> of {lostItems.length} items
        </div>

        {loading ? (
          <div className="empty-items">
            <div className="empty-icon">⏳</div>
            <h3>Loading Lost Items...</h3>
            <p>Please wait a moment.</p>
          </div>
        ) : error ? (
          <div className="empty-items error-box">
            <div className="empty-icon">⚠️</div>
            <h3>Unable to Load Items</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={fetchLostItems} type="button">
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-items">
            <div className="empty-icon">🔎</div>
            <h3>No Lost Items Found</h3>
            <p>Try another search term or category.</p>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map((item) => (
              <article className="item-card" key={item._id}>
                {item.imageUrl ? (
                  <img className="item-image" src={item.imageUrl} alt={item.itemName} />
                ) : (
                  <div className="item-image-placeholder">🔍</div>
                )}

                <div className="item-card-body">
                  <div className="item-card-top">
                    <span className={`item-status ${item.status === 'Found' ? 'status-found' : 'status-lost'}`}>
                      {item.status === 'Found' ? '✅ FOUND' : '🔴 LOST'}
                    </span>
                    <span className="item-category">{item.category}</span>
                  </div>

                  <h3>{item.itemName}</h3>
                  <p className="item-description">{item.description}</p>

                  <div className="item-details">
                    <div className="detail-row"><span>📍</span><div><small>Location</small><strong>{item.location}</strong></div></div>
                    <div className="detail-row"><span>📅</span><div><small>Date</small><strong>{item.date}</strong></div></div>
                    <div className="detail-row"><span>📞</span><div><small>Contact</small><strong>{item.contact}</strong></div></div>
                  </div>

                  {item.status !== 'Found' && (
                    <button
                      className="match-btn"
                      onClick={() => findMatches(item._id)}
                      type="button"
                      disabled={matchingId === item._id}
                    >
                      {matchingId === item._id
                        ? 'Finding Matches...'
                        : openMatchId === item._id
                          ? '▲ Hide Matches'
                          : '🎯 Find Possible Matches'}
                    </button>
                  )}

                  {openMatchId === item._id && (
                    <div className="matches-panel">
                      <h4>Possible Found Matches</h4>
                      {matches[item._id]?.length ? (
                        matches[item._id].map((match) => (
                          <div className="match-card" key={match.item._id}>
                            {match.item.imageUrl && (
                              <img src={match.item.imageUrl} alt={match.item.itemName} />
                            )}
                            <div className="match-card-content">
                              <div className="match-score">{match.matchScore}% Match</div>
                              <strong>{match.item.itemName}</strong>
                              <span>{match.item.category} · {match.item.location}</span>
                              <p>{match.item.description}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="no-match-text">No strong matches found yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default LostItems
