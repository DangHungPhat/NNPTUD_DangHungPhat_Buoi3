// Biến toàn cục lưu trữ dữ liệu
let allProducts = [];
let filteredProducts = [];

// Cấu hình phân trang mặc định
let currentPage = 1;
let pageSize = 5;

// Hàm getAll để lấy dữ liệu từ API
async function getAllProducts() {
    try {
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        const data = await response.json();
        
        // Lưu dữ liệu gốc
        allProducts = data;
        // Khởi tạo dữ liệu đã lọc (ban đầu bằng dữ liệu gốc)
        filteredProducts = [...allProducts];
        
        // Hiển thị dữ liệu lần đầu
        renderTable();
        renderPagination();
    } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        alert("Không thể tải dữ liệu từ API.");
    }
}

// Hàm render bảng dữ liệu
function renderTable() {
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = ''; // Xóa nội dung cũ

    // Tính toán vị trí bắt đầu và kết thúc cho phân trang
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

    if (productsToDisplay.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: #555;">Không tìm thấy sản phẩm nào.</td></tr>';
        return;
    }

    productsToDisplay.forEach(product => {
        // Xử lý hiển thị toàn bộ hình ảnh
        let imagesHtml = '';
        if (product.images && product.images.length > 0) {
            imagesHtml = `<div class="img-container">
                ${product.images.map(img => {
                    // Xử lý chuỗi JSON lỗi từ API (đôi khi API trả về chuỗi ["..."])
                    let cleanSrc = img.replace(/[\[\]"]/g, '');
                    return `<img src="${cleanSrc}" class="product-img" alt="img" onerror="this.style.display='none'">`;
                }).join('')}
            </div>`;
        } else {
            imagesHtml = 'Không có ảnh';
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.title}</td>
            <td>$${product.price}</td>
            <td>${product.description.substring(0, 50)}...</td>
            <td>${imagesHtml}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Hàm render nút phân trang
function renderPagination() {
    const paginationContainer = document.getElementById('paginationControls');
    paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(filteredProducts.length / pageSize);

    // Nút Previous
    const prevBtn = document.createElement('button');
    prevBtn.innerText = 'Trước';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    paginationContainer.appendChild(prevBtn);

    // Các nút số trang (Hiển thị tối đa 5 trang để gọn)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.innerText = i;
        if (i === currentPage) btn.classList.add('active');
        btn.onclick = () => changePage(i);
        paginationContainer.appendChild(btn);
    }

    // Nút Next
    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Sau';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.onclick = () => changePage(currentPage + 1);
    paginationContainer.appendChild(nextBtn);
}

// Hàm chuyển trang
function changePage(page) {
    currentPage = page;
    renderTable();
    renderPagination();
}

// Xử lý Tìm kiếm (onChange)
document.getElementById('searchInput').addEventListener('input', function(e) {
    const keyword = e.target.value.toLowerCase();
    
    // Lọc dữ liệu từ mảng gốc
    filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(keyword)
    );

    // Reset về trang 1 sau khi tìm kiếm
    currentPage = 1;
    renderTable();
    renderPagination();
});

// Xử lý thay đổi số lượng hiển thị (5, 10, 20)
document.getElementById('pageSizeSelect').addEventListener('change', function(e) {
    pageSize = parseInt(e.target.value);
    currentPage = 1; // Reset về trang 1
    renderTable();
    renderPagination();
});

// Hàm Sắp xếp
function sortData(field, direction) {
    filteredProducts.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];

        // Nếu là chuỗi thì chuyển về chữ thường để so sánh chính xác
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (direction === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    renderTable();
    // Không cần reset trang khi sắp xếp, giữ nguyên trang hiện tại để trải nghiệm tốt hơn
}

// Khởi chạy khi load trang
window.onload = getAllProducts;