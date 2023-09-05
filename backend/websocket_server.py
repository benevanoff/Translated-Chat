import asyncio
from websockets.server import serve
import websockets
import pymysql
import time
from uuid import uuid4
import os
from multiprocessing import Process, Manager

async def echo(websocket, path, messages_dict):
    print("starting server")
    try:
        # add this client to the dict of messages
        client_id = str(uuid4())
        messages_dict[client_id] = None
        while True:
            if  messages_dict[client_id]:
                message = "PING"
                print(f"sending {message} to {client_id}")
                await websocket.send(message)
                messages_dict[client_id] = None
            await asyncio.sleep(1)
    except websockets.exceptions.ConnectionClosedError:
        print("Connection closed")
    finally:
        del messages_dict[client_id]

async def main(messages_dict):
    server = await serve(lambda ws, path: echo(ws, path, messages_dict), "localhost", 8080)
    await server.wait_closed()

def poll_db(messages_dict):
    sql_conn = pymysql.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'root'),
        password=os.environ.get('DB_PASSWORD', 'yourpassword'),
        database=os.environ.get('DB_NAME', 'translated_chat'),
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )
    most_recent_known_timestamp = None
    with sql_conn.cursor() as cur:
        while True:
            query = """
                SELECT * FROM chats
                ORDER BY timestamp DESC
            """
            cur.execute(query)
            chats = cur.fetchall()
            if not most_recent_known_timestamp or most_recent_known_timestamp < chats[0]['timestamp']:
                most_recent_known_timestamp = chats[0]['timestamp']
                if messages_dict:
                    print(type(messages_dict))
                    for client in messages_dict.keys():
                        messages_dict[client] = chats[0]
                else:
                    print("!!")
            else:
                pass #print("poller: no new messages")
            time.sleep(2)

if __name__ == "__main__":
    #if os.environ.get("DB_PASSWORD") == None:
    #    print("!!!")
    #    quit()

    with Manager() as manager:
        messages_dict = manager.dict({})
        db_poller = Process(target=poll_db, args=(messages_dict,))
        db_poller.start()
        asyncio.run(main(messages_dict))