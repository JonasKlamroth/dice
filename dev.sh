#!/bin/bash

# Development automation script for Liar's Dice
# This script compiles TypeScript, starts the Flask server, and opens browser tabs for testing

set -e  # Exit on any error

echo "🎲 Starting Liar's Dice development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if virtual environment exists and is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    print_warning "Virtual environment not activated. Attempting to activate..."
    if [ -d "venv" ]; then
        source venv/bin/activate
        print_success "Virtual environment activated"
    else
        print_error "Virtual environment not found. Please run setup.sh first."
        exit 1
    fi
fi

# Check if TypeScript is installed
if ! command -v tsc &> /dev/null; then
    print_warning "TypeScript not found. Installing TypeScript..."
    npm install -g typescript
    print_success "TypeScript installed"
fi

# Function to compile TypeScript files
compile_typescript() {
    print_status "Compiling TypeScript files..."

    if [ -f tsconfig.json ]; then
        tsc
    else
        print_status "Error: tsconfig.json not found."
        return 1
    fi
}

# Function to kill existing server process
kill_server() {
    print_status "Checking for existing server processes..."
    if pgrep -f "python.*server.py" > /dev/null; then
        print_status "Killing existing server process..."
        pkill -f "python.*server.py"
        sleep 2
        print_success "Server process killed"
    fi
}

# Function to start the Flask server
start_server() {
    print_status "Starting Flask server..."
    python server.py &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 3
    
    # Check if server is running
    if curl -s http://localhost:5000 > /dev/null; then
        print_success "Server started successfully on http://localhost:5000"
    else
        print_error "Failed to start server"
        exit 1
    fi
}

# Function to open browser tabs
open_browser_tabs() {
    print_status "Opening browser tabs for testing..."
    
    # Detect available browsers
    if command -v firefox &> /dev/null; then
        BROWSER="firefox"
    elif command -v google-chrome &> /dev/null; then
        BROWSER="google-chrome"
    elif command -v chromium &> /dev/null; then
        BROWSER="chromium"
    else
        print_warning "No supported browser found. Please open http://localhost:5000 manually in two tabs."
        return
    fi
    
    # Open first tab
    print_status "Opening first player tab..."
    $BROWSER --new-tab http://localhost:5000 &
    sleep 2
    
    # Open second tab
    print_status "Opening second player tab..."
    $BROWSER --new-tab http://localhost:5000 &
    
    print_success "Two browser tabs opened for testing"
}

# Function to show game instructions
show_instructions() {
    echo ""
    print_success "🎲 Liar's Dice development environment is ready!"
    echo ""
    echo "📋 Game Instructions:"
    echo "  1. Two browser tabs should have opened automatically"
    echo "  2. In each tab, you'll see 'Waiting for players...'"
    echo "  3. Click 'Start Game' in one of the tabs"
    echo "  4. The game will begin with both players"
    echo ""
    echo "🎮 How to play:"
    echo "  - Use arrow keys to change your bid"
    echo "  - Press Enter to submit your bid"
    echo "  - Press Backspace to doubt the previous bid"
    echo ""
    echo "🛠️  Development:"
    echo "  - Edit TypeScript files in static/js/*.ts"
    echo "  - Run this script again to recompile and restart"
    echo "  - Server logs will appear in this terminal"
    echo ""
    echo "🔄 To restart: Ctrl+C and run ./dev.sh again"
    echo ""
}

# Function to handle cleanup on exit
cleanup() {
    print_status "Cleaning up..."
    kill_server
    print_success "Cleanup complete"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    # Compile TypeScript
    compile_typescript
    
    # Kill existing server
    kill_server
    
    # Start server
    start_server
    
    # Open browser tabs
    open_browser_tabs
    
    # Show instructions
    show_instructions
    
    # Keep the script running and show server logs
    print_status "Server is running. Press Ctrl+C to stop."
    wait $SERVER_PID
}

# Run main function
main 