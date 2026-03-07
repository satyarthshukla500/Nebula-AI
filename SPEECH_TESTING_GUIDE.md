# Speech Features Testing Guide

## 🎯 Quick Test (10 Minutes)

This guide helps you test both Speech-to-Text (STT) and Text-to-Speech (TTS) features in Nebula AI.

## 🚀 Prerequisites

1. **Start the server**:
   ```bash
   npm run dev
   ```

2. **Login**: Navigate to http://localhost:3000/auth/login

3. **Open a workspace**: Go to http://localhost:3000/dashboard/workspaces/chat

4. **Check browser**: Use Chrome or Edge for best STT support

## 🎤 Speech-to-Text (STT) Testing

### Test 1: Basic Voice Input

**Steps**:
1. Look for the microphone button beside the chat input
2. Click the microphone button
3. **Expected**: Button turns red and pulses
4. **Expected**: Browser asks for microphone permission (first time only)
5. Click "Allow" on the permission prompt
6. Speak clearly: "Hello, I need help with cooking pasta"
7. **Expected**: Text appears in the input field as you speak
8. **Expected**: Input field has blue background
9. **Expected**: Placeholder says "Listening... Speak now"
10. Click the microphone button again to stop
11. **Expected**: Button returns to gray
12. **Expected**: Text remains in input field
13. **Expected**: You can edit the text
14. Click "Send"
15. **Expected**: Message sent successfully

**Success Criteria**:
- ✅ Microphone button visible
- ✅ Permission prompt appears (first time)
- ✅ Button turns red while recording
- ✅ Text appears in real-time
- ✅ Can stop recording
- ✅ Can edit transcript
- ✅ Can send message

### Test 2: Real-time Transcript

**Steps**:
1. Click microphone button
2. Speak slowly with pauses: "This... is... a... test... message"
3. **Expected**: Words appear as you speak them
4. **Expected**: Interim results show in real-time
5. Stop recording
6. **Expected**: Final transcript is clean and accurate

**Success Criteria**:
- ✅ Real-time transcript updates
- ✅ Handles pauses correctly
- ✅ Final transcript is accurate

### Test 3: Error Handling - No Speech

**Steps**:
1. Click microphone button
2. Don't speak for 5-10 seconds
3. **Expected**: Error message appears: "No speech detected. Please try again."
4. **Expected**: Recording stops automatically
5. **Expected**: Error message disappears after 5 seconds

**Success Criteria**:
- ✅ Error message appears
- ✅ Recording stops
- ✅ Error auto-dismisses

### Test 4: Error Handling - Permission Denied

**Steps**:
1. Block microphone permission in browser settings
2. Click microphone button
3. **Expected**: Error message: "Microphone permission denied. Please allow microphone access."
4. Allow permission in browser settings
5. Click microphone again
6. **Expected**: Works normally

**Success Criteria**:
- ✅ Permission error shown
- ✅ Clear instructions provided
- ✅ Works after granting permission

### Test 5: Append to Existing Text

**Steps**:
1. Type in input: "I want to"
2. Click microphone button
3. Speak: "cook pasta for dinner"
4. Stop recording
5. **Expected**: Input shows: "I want to cook pasta for dinner"
6. Send message
7. **Expected**: Full message sent

**Success Criteria**:
- ✅ New text appends to existing
- ✅ Proper spacing
- ✅ Can send combined message

### Test 6: Multiple Recording Sessions

**Steps**:
1. Click mic, speak: "Hello"
2. Stop recording
3. Click mic again, speak: "How are you"
4. Stop recording
5. **Expected**: Input shows: "Hello How are you"

**Success Criteria**:
- ✅ Multiple sessions work
- ✅ Text accumulates correctly

### Test 7: Unsupported Browser (Firefox)

**Steps**:
1. Open in Firefox
2. Navigate to chat workspace
3. **Expected**: No microphone button visible
4. **Expected**: Message: "Voice input is not supported in this browser. Please use Chrome or Edge."

**Success Criteria**:
- ✅ Graceful degradation
- ✅ Clear message to user

## 🔊 Text-to-Speech (TTS) Testing

### Test 1: Basic Voice Output

**Steps**:
1. Send a message: "Tell me about cooking"
2. Wait for AI response
3. **Expected**: Speaker icon visible on AI message (top-right)
4. Click the speaker icon
5. **Expected**: AI response is read aloud
6. **Expected**: Speaker icon changes to pause icon (blue, pulsing)
7. **Expected**: Stop button appears (red)
8. Wait for speech to complete
9. **Expected**: Icons reset to speaker icon
10. **Expected**: Speech ends naturally

**Success Criteria**:
- ✅ Speaker icon visible on AI messages
- ✅ Click starts speech
- ✅ Visual feedback while speaking
- ✅ Stop button appears
- ✅ Speech completes naturally

### Test 2: Pause and Resume

**Steps**:
1. Get a long AI response (ask: "Explain how to make pasta in detail")
2. Click speaker icon
3. **Expected**: Speech starts
4. After 2-3 seconds, click pause icon
5. **Expected**: Speech pauses immediately
6. **Expected**: Pause icon changes to play icon
7. Wait 2 seconds
8. Click play icon
9. **Expected**: Speech resumes from where it paused
10. **Expected**: Play icon changes back to pause icon

**Success Criteria**:
- ✅ Pause works immediately
- ✅ Icon changes to play
- ✅ Resume continues from pause point
- ✅ Icon changes back to pause

### Test 3: Stop Speech

**Steps**:
1. Start reading a message
2. After 2 seconds, click stop button (red)
3. **Expected**: Speech stops immediately
4. **Expected**: Icons reset to speaker
5. Click speaker again
6. **Expected**: Speech starts from beginning

**Success Criteria**:
- ✅ Stop works immediately
- ✅ Icons reset
- ✅ Can restart from beginning

### Test 4: Multiple Messages

**Steps**:
1. Get AI response 1
2. Click speaker on message 1
3. **Expected**: Message 1 starts reading
4. Get AI response 2
5. Click speaker on message 2
6. **Expected**: Message 1 stops
7. **Expected**: Message 2 starts reading

**Success Criteria**:
- ✅ Only one message speaks at a time
- ✅ Previous speech stops automatically
- ✅ New speech starts immediately

### Test 5: User Messages (No Speaker)

**Steps**:
1. Look at your own messages (blue bubbles)
2. **Expected**: No speaker icon on user messages
3. **Expected**: Speaker icon only on AI messages (gray bubbles)

**Success Criteria**:
- ✅ Speaker only on AI messages
- ✅ Not on user messages

### Test 6: Long Message

**Steps**:
1. Ask AI: "Write a long story about a chef"
2. Wait for long response
3. Click speaker icon
4. **Expected**: Entire message is read
5. **Expected**: Natural pauses at punctuation
6. **Expected**: Can pause/resume at any point

**Success Criteria**:
- ✅ Handles long text
- ✅ Natural speech rhythm
- ✅ Controls work throughout

### Test 7: Special Characters

**Steps**:
1. Ask AI: "Explain code: const x = 5;"
2. Click speaker on response
3. **Expected**: Code is read (may sound technical)
4. **Expected**: No errors or crashes

**Success Criteria**:
- ✅ Handles code snippets
- ✅ No crashes
- ✅ Completes reading

## 🎭 Combined Features Testing

### Test 1: Full Voice Conversation

**Steps**:
1. Click microphone button
2. Speak: "What is machine learning?"
3. Stop recording
4. Click Send
5. Wait for AI response
6. Click speaker on AI response
7. Listen to response
8. Click microphone again
9. Speak: "Can you explain more?"
10. Stop and send
11. Click speaker on new response

**Success Criteria**:
- ✅ STT works for input
- ✅ TTS works for output
- ✅ Can chain multiple interactions
- ✅ Smooth workflow

### Test 2: Multitasking

**Steps**:
1. Start reading an AI response (TTS)
2. While it's reading, try to click microphone
3. **Expected**: Microphone disabled while TTS is active
4. Stop TTS
5. **Expected**: Microphone becomes available

**Success Criteria**:
- ✅ Can't record while TTS is active
- ✅ Clear visual indication
- ✅ Works after TTS stops

### Test 3: Rapid Switching

**Steps**:
1. Click mic, speak briefly, stop
2. Send message
3. Immediately click speaker on response
4. Pause speech
5. Click mic again
6. Speak another message

**Success Criteria**:
- ✅ No conflicts between features
- ✅ Smooth transitions
- ✅ No errors

## 📱 Mobile Testing

### iOS Safari

**STT Test**:
1. Open on iPhone/iPad
2. Navigate to chat
3. Tap microphone button
4. **Expected**: Permission prompt
5. Speak message
6. **Expected**: Text appears (may have slight delay)

**TTS Test**:
1. Get AI response
2. Tap speaker icon
3. **Expected**: Response is read aloud
4. **Expected**: Can pause/resume/stop

**Success Criteria**:
- ✅ STT works (iOS 14.5+)
- ✅ TTS works with Siri voices
- ✅ Touch targets are large enough

### Android Chrome

**STT Test**:
1. Open on Android device
2. Navigate to chat
3. Tap microphone button
4. Speak message
5. **Expected**: Works same as desktop

**TTS Test**:
1. Get AI response
2. Tap speaker icon
3. **Expected**: Works same as desktop

**Success Criteria**:
- ✅ Full STT support
- ✅ Full TTS support
- ✅ Same experience as desktop

## 🔍 Browser Compatibility Testing

### Chrome (Desktop)

**Expected**:
- ✅ STT: Full support
- ✅ TTS: Full support
- ✅ Best experience

### Edge (Desktop)

**Expected**:
- ✅ STT: Full support
- ✅ TTS: Full support
- ✅ Windows voices

### Safari (macOS)

**Expected**:
- ⚠️ STT: Limited support
- ✅ TTS: Excellent (Siri voices)

### Firefox (Desktop)

**Expected**:
- ❌ STT: Not supported
- ✅ TTS: Good support

## 🐛 Common Issues & Solutions

### Issue: Microphone button not visible

**Check**:
1. Are you using Chrome or Edge?
2. Is JavaScript enabled?
3. Check browser console for errors

**Solution**: Use Chrome or Edge for STT

### Issue: Permission denied

**Check**:
1. Browser settings → Site permissions → Microphone
2. System settings → Privacy → Microphone

**Solution**: Allow microphone access in settings

### Issue: No sound from TTS

**Check**:
1. System volume
2. Browser not muted
3. Audio output device

**Solution**: Check volume and audio settings

### Issue: Inaccurate transcription

**Check**:
1. Background noise
2. Microphone quality
3. Speaking clarity

**Solution**: Speak clearly in quiet environment

### Issue: Speech sounds robotic

**Check**:
1. Browser voice quality
2. System TTS voices

**Solution**: This is normal, browser uses best available voice

## 📊 Test Results Template

Use this template to record your test results:

```
Date: ___________
Browser: ___________
OS: ___________

Speech-to-Text (STT):
[ ] Basic voice input works
[ ] Real-time transcript appears
[ ] Error handling works
[ ] Permission handling works
[ ] Can edit transcript
[ ] Can send message

Text-to-Speech (TTS):
[ ] Speaker icon visible
[ ] Click starts speech
[ ] Pause/Resume works
[ ] Stop button works
[ ] Multiple messages work
[ ] Natural-sounding voice

Combined Features:
[ ] Full voice conversation works
[ ] No conflicts between features
[ ] Smooth user experience

Mobile (if applicable):
[ ] STT works on mobile
[ ] TTS works on mobile
[ ] Touch targets appropriate

Issues Found:
_________________________________
_________________________________
_________________________________

Overall Rating: ___/10
```

## ✅ Success Checklist

### Speech-to-Text
- [ ] Microphone button visible
- [ ] Permission prompt works
- [ ] Recording starts/stops
- [ ] Real-time transcript
- [ ] Error messages appear
- [ ] Can edit transcript
- [ ] Can send message
- [ ] Works in Chrome/Edge
- [ ] Graceful degradation in Firefox

### Text-to-Speech
- [ ] Speaker icon on AI messages
- [ ] Click starts speech
- [ ] Pause button works
- [ ] Resume button works
- [ ] Stop button works
- [ ] Visual feedback (pulsing)
- [ ] Natural-sounding voice
- [ ] Works in all browsers
- [ ] Multiple messages work

### User Experience
- [ ] Intuitive controls
- [ ] Clear visual feedback
- [ ] Error messages helpful
- [ ] Mobile-friendly
- [ ] No performance issues
- [ ] Accessible
- [ ] Professional appearance

## 🎉 Final Verification

If all tests pass, you should have:

✅ **Working STT**: Users can speak their messages
✅ **Working TTS**: Users can listen to AI responses
✅ **Error Handling**: Clear messages for all errors
✅ **Browser Support**: Works in supported browsers
✅ **Mobile Support**: Works on iOS and Android
✅ **User Experience**: Intuitive and professional
✅ **Performance**: Fast and responsive
✅ **Accessibility**: Helps all users

## 📝 Notes

- Test in a quiet environment for best STT results
- Use headphones to avoid TTS feedback into microphone
- Test with different message lengths
- Test with different accents/languages
- Test on different devices
- Test with slow/fast internet (shouldn't matter - all local!)

## 🚀 Ready for Production

Once all tests pass, the voice features are ready for production use!

**Status**: 🟢 **READY**

Users can now have fully voice-enabled conversations with Nebula AI! 🎤🔊
