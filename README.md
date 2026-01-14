# Road Talk - V2V Voice App (MVP)

## 1. Prerequisites
- **Node.js** (v18+)
- **Supabase Account** (Free tier is fine)
- **Expo Go App** installed on your iOS/Android physical device (Recommended for GPS/Mic testing).

## 2. Supabase Setup (Database)
1.  Go to [Supabase](https://supabase.com) and create a new project.
2.  In the Dashboard, go to the **SQL Editor**.
3.  Copy the contents of `supabase/schema.sql` from this project and paste it into the editor.
4.  Click **Run** to create the tables and functions.
    *   *Note: This schema enables PostGIS and creates the necessary RPC functions for proximity.*

## 3. Environment Configuration
1.  Open the `.env` file in the root directory.
2.  Update the `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` with your project's credentials.
    *   You can find these in Supabase Dashboard -> **Project Settings** -> **API**.

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Running the App
1.  Install dependencies (if you haven't already):
    ```bash
    npm install
    ```
2.  Start the development server:
    ```bash
    npx expo start
    ```
3.  **To Test:**
    *   **Physical Device**: Scan the QR code with your Camera (iOS) or Expo Go (Android).
    *   **Simulator**: Press `i` for iOS Simulator or `a` for Android Emulator.
    *   *Note: WebRTC and GPS work best on real devices.*

## 5. Testing V2V Features
To test the "Vehicle-to-Vehicle" features, you need **two clients**:
1.  Run the app on Device A. Enter a plate (e.g., `CAR-001`).
2.  Run the app on Device B (or a Simulator). Enter a different plate (e.g., `TRK-999`).
3.  Ensure both devices have **Location Permissions** allowed.
4.  Go to the **Radar** tab. You should see the other vehicle appear as a dot (if simulated, you might need to use the simulator's location features to place them close to each other, < 500m).
5.  Go to **Drivers** tab on Device A, tap the **Mic** icon next to `TRK-999` to call.
6.  Device B should automatically route to the Call screen.
7.  Hold the PTT button to talk!
