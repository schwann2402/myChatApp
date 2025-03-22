
run-ios:
	cd app/app && npm run ios 

run-android:
	cd app/app && npm run android

server:
	. env/bin/activate && cd api && python3 manage.py runserver
