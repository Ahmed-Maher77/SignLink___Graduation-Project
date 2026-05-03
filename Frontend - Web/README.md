# SignLink - Frontend Web Application

A real-time video calling application with sign language recognition and correction capabilities.

## Features

### Video Calling

-   Real-time video and audio communication using WebRTC
-   Screen sharing functionality
-   Call controls (mute, camera toggle, screen share)
-   Call duration tracking
-   Participant management

### Sign Language Recognition

-   Real-time sign language recognition using AI models
-   Live prediction display with confidence scores
-   Progress tracking for frame processing
-   Connection status monitoring

### **NEW: Real-time Corrected Sentence Sharing**

-   WebRTC data channels for sharing corrected sentences between call participants
-   Automatic transmission of corrected sentences from local to remote participant
-   Real-time display of remote participant's corrected sentences
-   **Synchronized clearing**: When sender's corrected sentence disappears, it also disappears from receiver's screen
-   Reliable message delivery with retransmission support

## WebRTC Data Channel Implementation

The application now includes WebRTC data channel functionality to share corrected sentences between call participants:

### How it works:

1. **Data Channel Setup**: When a call is created, a data channel named "correctedSentence" is established
2. **Message Format**: Corrected sentences are sent as JSON messages with type, content, and timestamp
3. **Automatic Transmission**: When the local AI model generates a corrected sentence, it's automatically sent to the remote participant
4. **Real-time Display**: Remote participants see the corrected sentences in real-time on their video stream
5. **Synchronized Clearing**: When the sender's corrected sentence becomes empty, an empty string is sent to clear the remote display

### Technical Details:

-   **Channel Configuration**: Ordered delivery with up to 3 retransmissions
-   **Message Structure**:
    ```json
    {
        "type": "correctedSentence",
        "sentence": "The corrected text",
        "timestamp": 1234567890
    }
    ```
-   **Connection Status**: Tracks data channel connection state for debugging
-   **Cleanup**: Proper cleanup of data channels when calls end

### Debugging:

-   Console logs show data channel connection status
-   Message transmission is logged for debugging
-   Connection state is tracked and displayed

## Getting Started

1. Install dependencies:

    ```bash
    npm install
    ```

2. Start the development server:

    ```bash
    npm run dev
    ```

3. Open your browser and navigate to the application

## Dependencies

-   React 18
-   WebRTC for video calling
-   Firebase for signaling
-   Redux Toolkit for state management
-   Tailwind CSS for styling

## Browser Support

-   Modern browsers with WebRTC support
-   Chrome, Firefox, Safari, Edge
-   Requires camera and microphone permissions
