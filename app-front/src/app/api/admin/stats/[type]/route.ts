import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const type = params.type;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    let endpoint = '';
    switch (type) {
      case 'registrations':
        endpoint = '/api/admin/stats/registrations';
        break;
      case 'bookings':
        endpoint = '/api/admin/stats/bookings';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid statistics type' },
          { status: 400 }
        );
    }

    const response = await axios.get(`${baseUrl}${endpoint}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 