import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaImage, FaTimes, FaFileArchive } from 'react-icons/fa';

function AddProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [productFile, setProductFile] = useState(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const processSingleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    } else {
      alert('Hanya file gambar yang diizinkan!');
    }
  };

  const handleThumbnailChange = (e) => {
    processSingleFile(e.target.files[0]);
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processSingleFile(e.dataTransfer.files[0]);
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setGalleryFiles(prev => [...prev, ...files]);
    const previews = files.map(file => URL.createObjectURL(file));
    setGalleryPreviews(prev => [...prev, ...previews]);
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setGalleryFiles(prevFiles => prevFiles.filter((_, index) => index !== indexToRemove));
    setGalleryPreviews(prevPreviews => prevPreviews.filter((_, index) => index !== indexToRemove));
  };

  const handleProductFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/zip', 'application/x-rar-compressed', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Tipe file tidak valid! Harap upload .zip, .rar, atau .pdf');
        e.target.value = null;
        return;
      }
      setProductFile(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!thumbnailFile || !productFile) {
      alert('Gambar thumbnail dan File Produk Digital wajib diupload!');
      return;
    }
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', Number(price));
    formData.append('thumbnail', thumbnailFile);
    formData.append('productFile', productFile);
    galleryFiles.forEach(file => {
      formData.append('galleryImages', file);
    });

    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Produk berhasil ditambahkan!');
        navigate('/dashboard/my-products');
      } else {
        throw new Error(data.message || 'Gagal menambahkan produk.');
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Tambah Produk Digital Baru</h2>
        
        <form onSubmit={handleSubmit}>
          {/* ... Input Nama ... */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">Nama Produk</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
          </div>

          {/* ... Input Thumbnail ... */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Gambar Thumbnail (Wajib)</label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                {thumbnailPreview ? (
                  <div className="relative inline-block group">
                    <img src={thumbnailPreview} alt="Pratinjau Thumbnail" className="h-24 w-auto rounded-md" />
                    <button
                      type="button"
                      onClick={handleRemoveThumbnail}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ) : (
                  <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="thumbnail-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload sebuah file</span>
                    <input id="thumbnail-upload" name="thumbnail" type="file" className="sr-only" onChange={handleThumbnailChange} accept="image/*" />
                  </label>
                  <p className="pl-1">atau seret dan lepas</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF hingga 2MB</p>
              </div>
            </div>
          </div>
          
          {/* ... Input Galeri ... */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Gambar Galeri (Opsional, maks. 8)</label>
            <input id="gallery-upload" name="galleryImages" type="file" multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={handleGalleryChange} accept="image/*" />
            {galleryPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {galleryPreviews.map((src, index) => (
                  <div key={index} className="relative group w-20 h-20">
                    <img src={src} alt={`Pratinjau ${index + 1}`} className="h-20 w-20 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ... Input File Produk ... */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="product-file-upload">
              File Produk Digital (Wajib)
            </label>
            {productFile ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-md border border-green-200">
                <div className="flex items-center space-x-3 text-sm">
                  <FaFileArchive className="text-green-600" />
                  <span className="font-medium text-gray-800">{productFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setProductFile(null)}
                  className="text-red-500 hover:text-red-700 font-bold"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <input 
                id="product-file-upload" 
                name="productFile" 
                type="file" 
                required 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" 
                onChange={handleProductFileChange} 
                accept=".zip,.rar,.pdf" 
              />
            )}
            <p className="text-xs text-gray-500 mt-1">Upload file .zip, .rar, atau .pdf yang akan diterima pembeli (Maks. 50MB).</p>
          </div>

          {/*input dan deskripsi harga*/}
          <div className="mb-4"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Deskripsi</label><textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-32"></textarea></div>
          <div className="mb-6"><label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">Harga (Rp)</label><input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" /></div>

          <button type="submit" disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline disabled:opacity-50 text-lg">
            {isLoading ? 'Menambahkan...' : 'Tambah Produk'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddProductPage;
