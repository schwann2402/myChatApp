
run-ios:
	cd fe_app && npm run ios 

run-android:
	cd fe_app && npm run android

server:
	. env/bin/activate && cd api && python3 manage.py runserver

redis: 
	redis-server
