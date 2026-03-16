# Ping Monitoring Console App

Simple console application that periodically monitors the availability of an URL using a test API and calculates basic response statistics.

## Features
- Sends a POST request to the monitoring API every 10 seconds
- Measures RTT (Round Trip Time)
- Stores the last 100 samples in memory
- Calculates statistics in real time:
  - Maximum RTT
  - Minimum RTT
  - Average RTT
  - Packet loss (%)
 
Test API used for monitoring:

https://performance.t-mobile.cz/test2/_ua/juniordev/ping

Authentication: **Basic Auth**

Request body example:

```json
{
  "ip": "62.141.14.33"
}
```
## How to Run
1) Install Node.js (recommended v18+)
2) Clone repository
 ```
git clone https://github.com/miccerny/Monitor.git
cd Monitor
```
3) Run the application
```
node pingMonitor.js
```

## Technologies
- Node.js
- Fetch API
- JavaScript
