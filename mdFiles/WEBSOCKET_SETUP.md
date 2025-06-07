# 🚀 WebSocket Server Setup & Testing Guide

This guide will help you set up and test the WebSocket server connection with your Skrawl React Native app.

## 📋 Prerequisites

1. **Supabase Service Role Key**: You need to get this from your Supabase dashboard
2. **React Native app running**: Your Skrawl app should be running in development mode
3. **Node.js 18+**: Required for the WebSocket server

## 🔧 Step 1: Get Supabase Service Role Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `rtvqfvaprpovtcmtyqht`
3. Navigate to: **Settings** → **API**
4. Copy the **"service_role"** key (NOT the anon key)
   
   ⚠️ **Important**: This key is secret and should never be exposed in client code!

## 🛠️ Step 2: Configure WebSocket Server

1. **Navigate to WebSocket server directory**:
   ```bash
   cd skrawl-websocket-server
   ```

2. **Run the setup script**:
   ```bash
   npm run setup-env
   ```

3. **Follow the prompts**:
   - Supabase URL: `https://rtvqfvaprpovtcmtyqht.supabase.co` (default)
   - Service Role Key: Paste the key you copied from Step 1
   - Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0dnFmdmFwcnBvdnRjbXR5cWh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NTY4NzAsImV4cCI6MjA2NDMzMjg3MH0.ZgJtyFBAlG9u1HyrsAYVB1amcQ-PGAfFSDlE04FnbC0`
   - JWT Secret: Press Enter for auto-generated
   - Server Port: `3001` (default)

## 🚀 Step 3: Start WebSocket Server

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Verify server is running**:
   - You should see: `✅ Supabase client initialized for WebSocket server`
   - Server should be running on: `http://localhost:3001`

3. **Test health endpoint**:
   ```bash
   curl http://localhost:3001/health
   ```

## 📱 Step 4: Test React Native Connection

1. **Start your React Native app**:
   ```bash
   cd ../Skrawl
   npm start
   ```

2. **Open the app** in Expo Go or your emulator

3. **Navigate to Dashboard** and look for the **"WS"** button in the top-right corner (development mode only)

4. **Tap the WS button** to open the WebSocket test panel

5. **Test the connection**:
   - Tap "Connect to Server"
   - You should see "✅ Connected" status
   - Latency should show (e.g., "25ms")

## 🔍 Step 5: Verify Connection

### In the WebSocket Server Console:
You should see logs like:
```
🔐 Authentication attempt for socket abc123
✅ Socket abc123 authenticated as YourName (user-id)
📱 Mobile client connected: abc123 (User: YourName)
💓 Heartbeat: 25ms
```

### In the React Native App:
- Connection status should show "✅ Connected"
- Latency should be displayed
- You can test "Join Public Game" and "Create Private Room" buttons (they will show "not implemented" messages for now)

## 🐛 Troubleshooting

### ❌ "Authentication token required"
- Make sure you're logged in to the Skrawl app
- Check that your Supabase session is valid

### ❌ "Invalid authentication token"
- Verify the Service Role Key is correct
- Check that the Supabase URL matches your project

### ❌ "Connection timeout"
- Make sure the WebSocket server is running on port 3001
- Check that your firewall isn't blocking the connection
- Verify the WEBSOCKET_URL in your React Native .env file

### ❌ "CORS blocked origin"
- The server is configured to allow localhost and 192.168.x.x origins
- If using a different IP, add it to ALLOWED_ORIGINS in the server .env

## 📊 What's Working Now

✅ **Phase 1 Complete**:
- WebSocket server with mobile optimizations
- JWT authentication with Supabase
- Connection quality monitoring
- Mobile event handling (background/foreground)
- Network adaptation (WiFi/cellular)
- Heartbeat monitoring
- Automatic reconnection

🚧 **Coming in Phase 2**:
- Room creation and joining
- Public game matchmaking
- Lobby system with chat
- Player management

## 🔧 Development Commands

### WebSocket Server:
```bash
cd skrawl-websocket-server
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run setup-env    # Configure environment
```

### React Native App:
```bash
cd Skrawl
npm start            # Start Expo development server
```

## 📝 Next Steps

Once you have the WebSocket connection working:

1. **Test mobile events**: Try backgrounding/foregrounding the app
2. **Test network changes**: Switch between WiFi and cellular
3. **Monitor latency**: Watch the heartbeat measurements
4. **Ready for Phase 2**: Room management and game logic

## 🆘 Need Help?

If you encounter issues:

1. Check the WebSocket server console for error messages
2. Check the React Native console for connection errors
3. Verify all environment variables are set correctly
4. Make sure both server and app are running on the same network

The foundation is now ready for building the multiplayer game features!
