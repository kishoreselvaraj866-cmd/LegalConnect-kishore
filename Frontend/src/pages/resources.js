import { resourceService } from "../services/api.js";

// Map of PDF filenames to their ImageKit URLs
const pdfUrls = {
  "Woman_Law.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/Woman_Law.pdf?updatedAt=1742669340490",
  "englishconstitution.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/englishconstitution.pdf?updatedAt=1742669337718",
  "Model-Tenancy-Act-English.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/Model-Tenancy-Act-English-02_06_2021.pdf?updatedAt=1742669334836",
  "Labour_Law.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/Labour_Law.pdf?updatedAt=1742669334242",
  "RIGHT_EVICTION.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/RIGHT_EVICTION.pdf?updatedAt=1742669333941",
  "Tenants-Rights-Handbook.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/Tenants-Rights-Handbook.pdf?updatedAt=1742669333336",
  "PRIVACY_LAW.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/PRIVACY_LAW.pdf?updatedAt=1742669331369",
  "Notice-of-Termination.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/Notice-of-Termination.pdf?updatedAt=1742669330931",
  "DISCRIMINATION.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/DISCRIMATION.pdf?updatedAt=1742669330031",
  "Tenants-Rights.pdf":
    "https://ik.imagekit.io/waghDev/lawsphere/pdf/Tenants-Rights-Handbook.pdf?updatedAt=1742669333336",
};

export function renderResourcesPage() {
  const mainContent = document.getElementById("main-content");

  // Show loading state
  mainContent.innerHTML = `
    <section class="resources-page">
      <h1 class="page-title">Legal Resources</h1>
      <p class="page-description">Access free legal guides, templates, and educational materials.</p>
      <div class="resources-filter card">
        <div class="filter-section">
          <span class="filter-label">Category:</span>
          <div class="filter-options" id="category-filters">
            <button class="filter-btn active" data-filter="all">All</button>
            <!-- Categories will be loaded dynamically -->
          </div>
        </div>
        <div class="filter-section">
          <span class="filter-label">Type:</span>
          <div class="filter-options" id="type-filters">
            <button class="filter-btn active" data-filter="all">All</button>
            <button class="filter-btn" data-filter="Guide">Guides</button>
            <button class="filter-btn" data-filter="Template">Templates</button>
            <button class="filter-btn" data-filter="Article">Articles</button>
          </div>
        </div>
        <div class="search-container">
          <input type="text" id="resource-search" placeholder="Search resources...">
          <button class="btn btn-outline" id="search-btn"><i class="fas fa-search"></i></button>
        </div>
      </div>
      <div class="resources-container" id="resources-container">
        <div class="loading-spinner">Loading resources...</div>
      </div>
    </section>
  `;

  // Load resources
  loadResources();

  // Load categories
  loadCategories();

  // Type filter: when user clicks a type, apply filter and reload
  document.querySelectorAll("#type-filters .filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#type-filters .filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const type = btn.dataset.filter;
      filterResources(type === "all" ? {} : { type });
    });
  });

  // Set up search functionality
  document.getElementById("search-btn").addEventListener("click", () => {
    filterResources();
  });

  // Enter key in search box
  document
    .getElementById("resource-search")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        document.getElementById("search-btn").click();
      }
    });
}

async function loadResources(filters = {}) {
  const resourcesContainer = document.getElementById("resources-container");

  try {
    // Get resources from API
    const response = await resourceService.getResources(filters);
    const resources = response.data.data;

    if (resources.length === 0) {
      resourcesContainer.innerHTML = `<p class="no-results">No resources found matching your criteria.</p>`;
      return;
    }

    // Render resources
    resourcesContainer.innerHTML = `
      <div class="resources-grid">
        ${resources.map((resource) => renderResourceCard(resource)).join("")}
      </div>
    `;

    // Add event listeners for action buttons
    document.querySelectorAll(".resource-view-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const resourceId = btn.dataset.id;
        const fileName = btn.dataset.file;

        try {
          // Increment view count first
          const response = await resourceService.incrementView(resourceId);

          // Update the view count in the UI if available
          if (response.data && response.data.views) {
            const viewCountEl = btn
              .closest(".resource-card")
              .querySelector(".resource-meta span:first-child");
            if (viewCountEl) {
              viewCountEl.innerHTML = `<i class="fas fa-eye"></i> ${response.data.views}`;
            }
          }

          // Then open the resource
          viewResource(fileName);
        } catch (error) {
          console.error("Error incrementing view count:", error);
          // Still open the resource even if count update fails
          viewResource(fileName);
        }
      });
    });

    document.querySelectorAll(".resource-download-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const resourceId = btn.dataset.id;
        const fileName = btn.dataset.file;

        try {
          // Increment download count
          const response = await resourceService.incrementDownload(resourceId);

          // Update the download count in the UI if available
          if (response.data && response.data.downloads) {
            const downloadCountEl = btn
              .closest(".resource-card")
              .querySelector(".resource-meta span:nth-child(2)");
            if (downloadCountEl) {
              downloadCountEl.innerHTML = `<i class="fas fa-download"></i> ${response.data.downloads}`;
            }
          }

          // Then trigger the download
          downloadResource(fileName);
        } catch (error) {
          console.error("Error incrementing download count:", error);
          // Still download the resource even if count update fails
          downloadResource(fileName);
        }
      });
    });
  } catch (error) {
    console.error("Error loading resources:", error);
    resourcesContainer.innerHTML = `<p class="error-message">Failed to load resources. Please try again later.</p>`;
  }
}

async function loadCategories() {
  try {
    // Get categories from API
    const response = await resourceService.getResourceCategories();
    const categories = response.data.data;

    const categoryFilters = document.getElementById("category-filters");

    // Add category filter buttons
    categories.forEach((category) => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.setAttribute("data-filter", category);
      button.textContent = category;

      button.addEventListener("click", () => {
        // Remove active class from all category buttons
        document
          .querySelectorAll("#category-filters .filter-btn")
          .forEach((btn) => btn.classList.remove("active"));

        // Add active class to clicked button
        button.classList.add("active");

        // Filter resources by category
        filterResources({ category });
      });

      categoryFilters.appendChild(button);
    });

    // Add event listener to "All" button
    const allButton = document.querySelector(
      "#category-filters .filter-btn[data-filter='all']"
    );
    allButton.addEventListener("click", () => {
      // Remove active class from all category buttons
      document
        .querySelectorAll("#category-filters .filter-btn")
        .forEach((btn) => btn.classList.remove("active"));

      // Add active class to "All" button
      allButton.classList.add("active");

      // Load all resources
      loadResources();
    });
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function getActiveFilters() {
  const filters = {};
  const activeCategory = document.querySelector("#category-filters .filter-btn.active");
  const activeType = document.querySelector("#type-filters .filter-btn.active");
  const searchInput = document.getElementById("resource-search");
  if (activeCategory && activeCategory.dataset.filter !== "all") {
    filters.category = activeCategory.dataset.filter;
  }
  if (activeType && activeType.dataset.filter !== "all") {
    filters.type = activeType.dataset.filter;
  }
  if (searchInput && searchInput.value.trim()) {
    filters.search = searchInput.value.trim();
  }
  return filters;
}

function filterResources(overrides = {}) {
  const filters = { ...getActiveFilters(), ...overrides };
  loadResources(filters);
}

function renderResourceCard(resource) {
  const hasFile = resource.file ? true : false;
  const views = resource.views ?? 0;
  const downloads = resource.downloads ?? 0;

  return `
    <div class="resource-card">
      <div class="resource-type ${(resource.type || "").toLowerCase()}">${
    resource.type || "Guide"
  }</div>
      <h3 class="resource-title">${resource.title}</h3>
      <p class="resource-category">${resource.category}</p>
      <p class="resource-description">${resource.description}</p>
      <div class="resource-meta">
        <span><i class="fas fa-eye"></i> ${views}</span>
        <span><i class="fas fa-download"></i> ${downloads}</span>
        ${resource.duration ? `<span><i class="fas fa-clock"></i> ${resource.duration}</span>` : ""}
      </div>
      <div class="resource-actions">
        ${
          hasFile
            ? `
          <button class="btn btn-primary resource-view-btn" data-id="${resource.id}" data-file="${resource.file}">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="btn btn-outline resource-download-btn" data-id="${resource.id}" data-file="${resource.file}">
            <i class="fas fa-download"></i> Download
          </button>
        `
            : `
          <button class="btn btn-primary" disabled>Coming Soon</button>
        `
        }
      </div>
    </div>
  `;
}

function viewResource(fileName) {
  // Open the PDF file in a new tab using the ImageKit URL
  const pdfUrl = pdfUrls[fileName] || `/pdfs/${fileName}`;
  const viewerWindow = window.open(pdfUrl, "_blank");

  // Add a direct download link to the opened window
  if (viewerWindow) {
    viewerWindow.addEventListener("load", function () {
      try {
        const downloadBar = document.createElement("div");
        downloadBar.style.cssText =
          "position:fixed;top:0;left:0;right:0;background-color:#2d5d7b;color:white;padding:10px;text-align:center;z-index:9999;";
        downloadBar.innerHTML = `Viewing: ${fileName} <a href="${pdfUrl}" download="${fileName}" style="color:white;margin-left:20px;text-decoration:underline;">Click here to download directly</a>`;
        viewerWindow.document.body.prepend(downloadBar);
      } catch (e) {
        // If we can't modify the opened window (due to cross-origin restrictions),
        // we don't show the download bar but the file still opens
        console.log("Could not add download bar to viewer window:", e);
      }
    });
  }
}

function downloadResource(fileName) {
  // Get ImageKit URL for the file
  const pdfUrl = pdfUrls[fileName] || `/pdfs/${fileName}`;

  // Create an anchor element for downloading
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = fileName; // Set the download attribute to force download
  link.target = "_blank"; // Open in new tab (needed for larger files)
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
