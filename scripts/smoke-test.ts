import { Category } from '@prisma/client';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:5000/api';

async function request(
  endpoint: string,
  options: {
    method?: string;
    token?: string;
    body?: any;
  } = {}
) {
  const { method = 'GET', token, body } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json();
  return { status: res.status, ok: res.ok, data: json };
}

async function runSmokeTest() {
  console.log('==================================================');
  console.log('🧪 LOCALCONNECT BACKEND API SMOKE TEST SUITE');
  console.log(`🌐 Target Base URL: ${BASE_URL}`);
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function logResult(step: string, success: boolean, detail?: string) {
    if (success) {
      console.log(`✅ [PASS] ${step}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${step} - ${detail || 'Step failed'}`);
      failed++;
    }
  }

  try {
    // 0. Healthcheck
    const health = await request('/health');
    logResult(
      '0. Healthcheck GET /api/health',
      health.ok && health.data.success,
      JSON.stringify(health.data)
    );

    // Get categories to pick a valid categoryId
    const categoriesRes = await request('/categories');
    const categories: Category[] = categoriesRes.data.data || [];
    const categoryId = categories.length > 0 ? categories[0].id : 'c1';

    // 1. Register Buyer
    const time = Date.now().toString().slice(-7);
    const buyerPhone = `+88018${time}`;
    const buyerRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'SmokeTest Buyer',
        phone: buyerPhone,
        password: 'password123',
        role: 'BUYER',
      },
    });

    const buyerToken = buyerRes.data.data?.accessToken;
    logResult(
      '1. Register Buyer (POST /api/auth/register)',
      buyerRes.status === 201 && !!buyerToken,
      buyerRes.data.error?.message
    );

    // 2. Register Provider
    const providerPhone = `+88019${time}`;
    const providerRes = await request('/auth/register', {
      method: 'POST',
      body: {
        name: 'SmokeTest Provider',
        phone: providerPhone,
        password: 'password123',
        role: 'PROVIDER',
      },
    });

    const providerToken = providerRes.data.data?.accessToken;
    logResult(
      '2. Register Provider (POST /api/auth/register)',
      providerRes.status === 201 && !!providerToken,
      providerRes.data.error?.message
    );

    // 3. Provider Creates Profile
    const profileRes = await request('/providers/me', {
      method: 'POST',
      token: providerToken,
      body: {
        businessName: `SmokeTest Pro Repairs ${time}`,
        description: 'Professional smoke test repairs and maintenance services in Gulshan',
        city: 'Dhaka',
        area: 'Gulshan',
        categoryIds: [categoryId],
      },
    });

    const providerId = profileRes.data.data?.id;
    logResult(
      '3. Provider Creates Profile (POST /api/providers/me)',
      profileRes.status === 201 && !!providerId,
      profileRes.data.error?.message
    );

    // 4. Provider Adds a Service
    const serviceRes = await request('/providers/me/services', {
      method: 'POST',
      token: providerToken,
      body: {
        name: 'Full Inspection & Tuning',
        priceMin: 1500,
        priceMax: 3000,
        unit: 'per visit',
      },
    });

    logResult(
      '4a. Provider Adds Service (POST /api/providers/me/services)',
      serviceRes.status === 201 && !!serviceRes.data.data?.id,
      serviceRes.data.error?.message
    );

    // 5. Provider Adds a Photo
    const photoRes = await request('/providers/me/photos', {
      method: 'POST',
      token: providerToken,
      body: {
        url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789',
        isCover: true,
      },
    });

    logResult(
      '4b. Provider Adds Photo (POST /api/providers/me/photos)',
      photoRes.status === 201 && !!photoRes.data.data?.id,
      photoRes.data.error?.message
    );

    // 6. Buyer Sends Inquiry
    const inquiryRes = await request('/inquiries', {
      method: 'POST',
      token: buyerToken,
      body: {
        providerId,
        message: 'Hello, need urgent electrical inspection tomorrow morning.',
      },
    });

    const inquiryId = inquiryRes.data.data?.id;
    logResult(
      '5. Buyer Sends Inquiry (POST /api/inquiries)',
      inquiryRes.status === 201 && !!inquiryId,
      inquiryRes.data.error?.message
    );

    // 7. Provider Accepts Inquiry
    const acceptRes = await request(`/inquiries/${inquiryId}/status`, {
      method: 'PATCH',
      token: providerToken,
      body: { status: 'ACCEPTED' },
    });

    logResult(
      '6a. Provider Accepts Inquiry (PATCH /api/inquiries/:id/status -> ACCEPTED)',
      acceptRes.status === 200 && acceptRes.data.data?.status === 'ACCEPTED',
      acceptRes.data.error?.message
    );

    // 8. Provider Completes Inquiry
    const completeRes = await request(`/inquiries/${inquiryId}/status`, {
      method: 'PATCH',
      token: providerToken,
      body: { status: 'COMPLETED' },
    });

    logResult(
      '6b. Provider Completes Inquiry (PATCH /api/inquiries/:id/status -> COMPLETED)',
      completeRes.status === 200 && completeRes.data.data?.status === 'COMPLETED',
      completeRes.data.error?.message
    );

    // 9. Buyer Submits Review
    const reviewRes = await request('/reviews', {
      method: 'POST',
      token: buyerToken,
      body: {
        inquiryId,
        rating: 5,
        comment: 'Outstanding inspection service! Fast and professional.',
      },
    });

    logResult(
      '7. Buyer Submits Review (POST /api/reviews)',
      reviewRes.status === 201 && reviewRes.data.data?.rating === 5,
      reviewRes.data.error?.message
    );

    // 10. Confirm Rating Update on GET /api/providers/:id
    const finalProviderRes = await request(`/providers/${providerId}`);
    const ratingAvg = finalProviderRes.data.data?.ratingAvg;
    const ratingCount = finalProviderRes.data.data?.ratingCount;

    logResult(
      '8. GET /api/providers/:id Confirms Rating Update (ratingAvg = 5.0, ratingCount = 1)',
      finalProviderRes.status === 200 && ratingAvg === 5 && ratingCount === 1,
      `Received ratingAvg=${ratingAvg}, ratingCount=${ratingCount}`
    );

    console.log('\n==================================================');
    console.log(`📊 SMOKE TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
    console.log('==================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Smoke test crashed with unexpected error:', err);
    process.exit(1);
  }
}

runSmokeTest();
