import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

const Landingpage = () => {
  const [landingPages, setLandingPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(null);
  const { user, api } = useAuth();
  const editorRef = useRef(null);
  const editorInstance = useRef(null);
  const textareaRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    content: ''
  });

  // Fetch landing pages on component mount and when user changes
  useEffect(() => {
    fetchLandingPages();
  }, [user]);

  // Initialize Jodit editor when modal opens
  useEffect(() => {
    if (isModalOpen && window.Jodit) {
      editorInstance.current = new window.Jodit(textareaRef.current, {
        disablePlugins: ['file'],
        uploader: {
          insertImageAsBase64URI: true
        },
        height: 400
      });

      // Set initial content if editing
      if (formData.content) {
        editorInstance.current.value = formData.content;
      }

      // Update form data when editor content changes
      editorInstance.current.events.on('change', (newContent) => {
        setFormData(prev => ({ ...prev, content: newContent }));
      });
    }

    // Cleanup when modal closes
    return () => {
      if (editorInstance.current) {
        editorInstance.current.destruct();
        editorInstance.current = null;
      }
    };
  }, [isModalOpen]);

  const fetchLandingPages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/landingpages');
      setLandingPages(response.data);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Get the latest content from editor
      if (editorInstance.current) {
        setFormData(prev => ({ ...prev, content: editorInstance.current.value }));
      }

      if (currentPage) {
        // Update existing page
        await api.put(`/landingpages/${currentPage._id}`, formData);
      } else {
        // Create new page
        await api.post('/landingpages', formData);
      }
      
      // Refresh the list and reset form
      fetchLandingPages();
      setIsModalOpen(false);
      setFormData({ name: '', slug: '', content: '' });
      setCurrentPage(null);
    } catch (error) {
      console.error('Error saving landing page:', error);
      alert(error.response?.data?.message || 'Error saving page');
    }
  };

  const handleEdit = (page) => {
    setCurrentPage(page);
    setFormData({
      name: page.name,
      slug: page.slug,
      content: page.content
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this landing page?')) {
      try {
        await api.delete(`/landingpages/${id}`);
        fetchLandingPages();
      } catch (error) {
        console.error('Error deleting landing page:', error);
        alert(error.response?.data?.message || 'Error deleting page');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page-container">
      <div className="table-header">
        <h1 className="page-title">Landing Pages</h1>
        {user?.role === 'admin' && (
          <button 
            className="create-btn"
            onClick={() => {
              setCurrentPage(null);
              setFormData({ name: '', slug: '', content: '' });
              setIsModalOpen(true);
            }}
          >
            <i className="fas fa-plus"></i> Create Page
          </button>
        )}
      </div>
      
      <div className="card">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                {user?.role === 'admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {landingPages.length > 0 ? landingPages.map((page) => (
                <tr key={page._id}>
                  <td>{page.name}</td>
                  <td>{page.slug}</td>
                  {user?.role === 'admin' && (
                    <td className="actions-container">
                      <button 
                        className="edit-btn"
                        onClick={() => handleEdit(page)}
                      >
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(page._id)}
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={user?.role === 'admin' ? 4 : 3} className="text-center">
                    No landing pages found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal - Shared for both operations */}
      {user?.role === 'admin' && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentPage(null);
            setFormData({ name: '', slug: '', content: '' });
          }}
          title={currentPage ? 'Edit Landing Page' : 'Create Landing Page'}
          width="90%"
          maxWidth="1000px"
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter page name"
              />
            </div>
            <div className="form-group">
              <label>Slug</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                placeholder="Enter URL slug"
              />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea 
                id="editor" 
                ref={textareaRef}
                style={{ display: 'none' }} // Hidden textarea for Jodit
              />
              <div ref={editorRef} className="jodit-editor-container"></div>
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentPage(null);
                  setFormData({ name: '', slug: '', content: '' });
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {currentPage ? 'Update Page' : 'Create Page'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Landingpage;