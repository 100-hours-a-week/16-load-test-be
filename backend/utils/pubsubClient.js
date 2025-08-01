const { createClient } = require('redis');
const crypto         = require('crypto');
const { pubsubHost, redisPort, redisPassword } = require('../config/keys');

// 샤딩 예시용 Redis endpoints (샤드 0~3)
const PUBSUB_REDIS_HOSTS = [
  { host: "13.125.133.227", port: 6379 },
];

const subscribers = [];
const publishers = [];

function hashRoomID(roomID) {
  const hash = crypto.createHash('md5').update(roomID).digest('hex');
  return parseInt(hash.slice(0, 8), 16) % PUBSUB_REDIS_HOSTS.length;
}

async function setup() {
  for (const { host, port } of PUBSUB_REDIS_HOSTS) {
    const url = redisPassword
      ? `redis://:${encodeURIComponent(redisPassword)}@${host}:${port}`
      : `redis://${host}:${port}`;

    const pub = createClient({ url });
    const sub = createClient({ url });
    await pub.connect();
    await sub.connect();
    publishers.push(pub);
    subscribers.push(sub);
  }
}

function publishMessage(roomID, event, payload) {
  const shard = hashRoomID(roomID);
  const channel = `room:${roomID}`;
  const message = JSON.stringify({ roomID, event, payload });
  return publishers[shard].publish(channel, message);
}

function subscribeRoom(roomID, onMessage) {
  const shard = hashRoomID(roomID);
  const channel = `room:${roomID}`;
  subscribers[shard].subscribe(channel, (msg) => {
    const { event, payload } = JSON.parse(msg);
    onMessage(event, payload);
  });
}

module.exports = {
  setup,
  publishMessage,
  subscribeRoom,
};
