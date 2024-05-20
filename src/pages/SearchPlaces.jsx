import { useState, useEffect } from "react";
import axios from "axios";
import "../style/SearchPlaces.css";

const SearchPlaces = () => {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [limit, setLimit] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limitWarning, setLimitWarning] = useState(false);

  const fetchData = async (searchQuery, limit, offset) => {
    if (!searchQuery) {
      setPlaces([]);
      setTotalCount(0);
      return;
    }
    setLoading(true);
    try {
      const options = {
        method: "GET",
        url: "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
        params: { namePrefix: searchQuery, limit, offset },
        headers: {
          "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
          "x-rapidapi-key":
            "bd019e1f27mshe22f320063e151bp148582jsne5a52667fa7d",
        },
      };

      const response = await axios.request(options);
      setPlaces(response.data.data);
      setTotalCount(response.data.metadata.totalCount);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(query, limit, (currentPage - 1) * limit);
  }, [query, limit, currentPage]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setCurrentPage(1);
      fetchData(query, limit, 0);
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    if (newLimit > 10) {
      setLimitWarning(true);
    } else {
      setLimitWarning(false);
      setLimit(newLimit);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="container">
      <div className="search-container">
        <input
          type="text"
          className="search-box"
          placeholder="Search places..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
      {loading ? (
        <div className="spinner">Loading...</div>
      ) : (
        <table className="places-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Place Name</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {places.length === 0 ? (
              <tr>
                <td colSpan="3">
                  {query ? "No result found" : "Start searching"}
                </td>
              </tr>
            ) : (
              places.map((place, index) => (
                <tr key={place.id}>
                  <td>{index + 1 + (currentPage - 1) * limit}</td>
                  <td>{place.name}</td>
                  <td>
                    <img
                      src={`https://www.countryflagsapi.com/png/${place.countryCode.toLowerCase()}`}
                      alt={place.country}
                      className="flag"
                    />
                    {place.country}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
      {totalCount > limit && (
        <div className="pagination-container">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          <span>{currentPage}</span>
          <button
            disabled={currentPage * limit >= totalCount}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
          <input
            type="number"
            className="limit-input"
            value={limit}
            onChange={handleLimitChange}
            min="1"
            max="10"
          />
          {limitWarning && (
            <span className="warning-message">Limit cannot exceed 10</span>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPlaces;
