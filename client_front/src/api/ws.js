import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

let stompClient = null
const txListeners = new Set()
const alertListeners = new Set()

export function connectWS() {
  const socket = new SockJS('/ws')
  stompClient = Stomp.over(socket)
  stompClient.debug = null
  stompClient.connect({}, () => {
    stompClient.subscribe('/topic/transactions', () => {
      txListeners.forEach(fn => fn())
    })
    stompClient.subscribe('/topic/alerts', (msg) => {
      alertListeners.forEach(fn => fn(msg.body))
    })
  })
}

export function onTransactionsUpdated(cb) {
  txListeners.add(cb)
  return () => txListeners.delete(cb)
}

export function onAlert(cb) {
  alertListeners.add(cb)
  return () => alertListeners.delete(cb)
}
