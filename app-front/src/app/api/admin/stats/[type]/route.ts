import { NextResponse } from 'next/server';
import axios from 'axios';            // если хочешь axios, иначе убери

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.pathname.split('/').pop() ?? '';

    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL;

    let endpoint: string;
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

    // вариант с axios
    const { data } = await axios.get(`${baseUrl}${endpoint}`);
    // вариант с fetch (на выбор)
    // const res = await fetch(`${baseUrl}${endpoint}`);
    // const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
