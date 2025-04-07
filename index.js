const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');
const cheerio = require('cheerio');

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

/**
 * Fetches HTML content from a URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} - The HTML content
 */
async function fetchPage(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
    return null;
  }
}

/**
 * Extracts PPTX download links from HTML
 * @param {string} html - The HTML content
 * @returns {Array<Object>} - Array of found links with text and URL
 */
function extractPPTXLinks(html) {
  const $ = cheerio.load(html);
  const links = [];
  
  // Look for wp-block-file elements which contain download buttons
  $('.wp-block-file').each((i, element) => {
    const downloadButton = $(element).find('.wp-block-file__button');
    if (downloadButton.length) {
      const downloadText = downloadButton.text().trim();
      // Find the anchor tag with the download link
      const downloadLink = $(element).find('a[href$=".pptx"]').attr('href');
      
      if (downloadLink) {
        links.push({
          text: downloadText,
          url: downloadLink
        });
      }
    }
  });

  // Also search for any direct links to PPTX files
  $('a[href$=".pptx"]').each((i, element) => {
    const href = $(element).attr('href');
    const text = $(element).text().trim();
    links.push({
      text: text || 'Unnamed PPTX Link',
      url: href
    });
  });

  return links;
}

/**
 * Downloads a file from a URL
 * @param {string} url - The URL to download
 * @param {string} filename - The filename to save as
 * @returns {Promise<void>}
 */
async function downloadFile(url, filename) {
  const filePath = path.join(downloadsDir, filename);
  
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${url}: ${error.message}`);
  }
}

/**
 * Sanitizes a string to be used as a filename
 * @param {string} text - The text to sanitize
 * @returns {string} - The sanitized text
 */
function sanitizeFilename(text) {
  return text
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Processes a URL to find and download PPTX files
 * @param {string} url - The URL to process
 */
async function processURL(url) {
  console.log(`Processing URL: ${url}`);
  
  const html = await fetchPage(url);
  if (!html) return;
  
  // Extract the page title for use in filenames
  const $ = cheerio.load(html);
  const pageTitle = $('title').text().trim();
  const sanitizedTitle = sanitizeFilename(pageTitle);
  
  // Extract PPTX links
  const pptxLinks = extractPPTXLinks(html);
  
  if (pptxLinks.length === 0) {
    console.log(`No PPTX links found in ${url}`);
    return;
  }
  
  console.log(`Found ${pptxLinks.length} PPTX links in ${url}`);
  
  // Download each PPTX file
  for (let i = 0; i < pptxLinks.length; i++) {
    const link = pptxLinks[i];
    console.log(`Downloading ${link.url}`);
    
    // Create filename: page-title_link-text.pptx
    const sanitizedLinkText = sanitizeFilename(link.text);
    const filename = `${sanitizedTitle}_${sanitizedLinkText}${i+1}.pptx`;
    
    await downloadFile(link.url, filename);
    console.log(`Downloaded to downloads/${filename}`);
  }
}

/**
 * Main function to process a list of URLs
 * @param {Array<string>} urls - List of URLs to process
 */
async function main(urls) {
  console.log('Starting PPTX download process...');
  console.log(`Found ${urls.length} URLs to process`);

  for (const url of urls) {
    await processURL(url);
  }

  console.log('All downloads completed!');
}

// Read URLs from a file (one URL per line)
function loadUrlsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.split('\n')
      .map(url => url.trim())
      .filter(url => url && !url.startsWith('#'));
  } catch (error) {
    console.error(`Error loading URLs from file: ${error.message}`);
    return [];
  }
}

// Usage option 1: URLs from command line arguments
let urls = process.argv.slice(2);

// Usage option 2: If no URLs provided via command line, check for urls.txt file
if (urls.length === 0) {
  const urlFilePath = path.join(__dirname, 'urls.txt');
  if (fs.existsSync(urlFilePath)) {
    urls = loadUrlsFromFile(urlFilePath);
  } else {
    // Default example URL from your question
    urls = ['https://yglect.com/2023/07/20/isletmeye-giris/'];
    console.log('No URLs provided. Using example URL.');
    console.log('To specify URLs, either:');
    console.log('1. Pass URLs as command line arguments: node script.js url1 url2');
    console.log('2. Create a urls.txt file with one URL per line');
  }
}

// Run the script
main(urls);