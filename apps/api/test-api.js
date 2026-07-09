const PORT = 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log("=== STARTING API VERIFICATION TESTS ===");
  
  // 1. Test Health GET /
  try {
    const res = await fetch(`${BASE_URL}/`);
    const data = await res.json();
    console.log("GET / (Health Check):", res.status, data);
    if (res.status === 200 && data.status === "running") {
      console.log("✅ GET / PASSED");
    } else {
      console.log("❌ GET / FAILED");
    }
  } catch (err) {
    console.error("❌ GET / failed with error:", err.message);
  }

  // 2. Test Analyze POST /api/v1/repositories/analyze (Valid URL)
  try {
    const res = await fetch(`${BASE_URL}/api/v1/repositories/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repositoryUrl: "https://github.com/facebook/react" }),
    });
    const data = await res.json();
    console.log("POST /api/v1/repositories/analyze (Valid):", res.status, JSON.stringify(data, null, 2));
    if (res.status === 200 && data.success === true && data.data.repository.name === "react") {
      console.log("✅ Valid Repository Test PASSED");
    } else {
      console.log("❌ Valid Repository Test FAILED");
    }
  } catch (err) {
    console.error("❌ Valid Repository Test failed:", err.message);
  }

  // 3. Test Analyze POST /api/v1/repositories/analyze (Invalid URL)
  try {
    const res = await fetch(`${BASE_URL}/api/v1/repositories/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repositoryUrl: "https://google.com" }),
    });
    const data = await res.json();
    console.log("POST /api/v1/repositories/analyze (Invalid URL):", res.status, data);
    if (res.status === 400 && data.success === false && data.error.code === "INVALID_URL") {
      console.log("✅ Invalid URL Test PASSED");
    } else {
      console.log("❌ Invalid URL Test FAILED");
    }
  } catch (err) {
    console.error("❌ Invalid URL Test failed:", err.message);
  }

  // 4. Test Analyze POST /api/v1/repositories/analyze (Not Found URL)
  try {
    const res = await fetch(`${BASE_URL}/api/v1/repositories/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repositoryUrl: "https://github.com/facebook/non-existent-repo-1234" }),
    });
    const data = await res.json();
    console.log("POST /api/v1/repositories/analyze (Not Found):", res.status, data);
    if (res.status === 404 && data.success === false && data.error.code === "REPOSITORY_NOT_FOUND") {
      console.log("✅ Not Found Test PASSED");
    } else {
      console.log("❌ Not Found Test FAILED");
    }
  } catch (err) {
    console.error("❌ Not Found Test failed:", err.message);
  }
}

runTests();
