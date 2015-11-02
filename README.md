# Bluemix Geofence Demo

This application demonstrates how a Streams application running on Bluemix and interacting with the IoT Foundation service, the MessageHub service and a Liberty for Java Runtime application. 

  
  
##### Step 1: Configuring the IoT Foundation Service

1. In the Bluemix Catalog, click on the Internet of Things Foundation Service
2. Click the CREATE button on the right (this will create the IoT service)
3. When the service has been created, click on the "Launch Dashboard" button
4. On the dashboard, make a note of the organization id at the top: (Organization ID: h9c1ru)
	* NOTE 1: The server URI will be: *[org_id]*.messaging.internetofthings.ibmcloud.com:1883
	* NOTE 2: The client ID will be: a:*[org_id]*:*[whatever_unique_name_you_want]*
5. Click on the Access tab
6. Click on the API Keys tab
7. Click "Generate API Key"
8. Make a note of the API Key and the Authentication Token
	* IMPORTANT: You must write down the Authentication Token immediately! Once you close the window, you will not be able to access the Authentication Token again. If you lose the Authentication Token, you will need to generate a new API Key
  ```  
    API Key 	a-h9c1ru-rbixxxxx7h
    Authentication Token 	GJYL*S98xxxxxTC2Bg
  ```
9. You now have all of the information necessary to send and receive to/from the IoT service. Next, configure the Message Hub service


##### Step 2: Configuring the Message Hub Service

1. In the Bluemix Catalog, click on the Message Hub Service
2. Click the CREATE button on the right (this will create the Message Hub service)
3. When the service has been created, click on the "Service Credentials" link on the left. 
4. Copy this information to a file as it will be necessary to configure the Streams application
5. The Message Hub is now configured. Next, configure your Streaming Analytics service.

##### Step 3: Configuring the Streaming Analytics Service

1. In the Bluemix Catalog, click on the Streaming Analytics Service
2. Click the CREATE button on the right (this will create the Streaming Analytics service)
3. Once the service is created, it should start automatically. No additional configuration is necessary. Continue with the next step, building and deploying the Streams application.

##### Step 4: Build and deploy the Streams Application

1. Download the source code for the "BluemixGeofenceSPL" application from here: https://github.com/cancilla/BluemixGeofenceDemo 
2. Import the SPL project into Streams Studio. The build initially fail because of missing toolkit dependencies. To add the necessary dependencies, perform the following: 
  1. For the "com.ibm.streams.geospatial" toolkit, add the toolkit that comes packaged with the product via the Streams Explorer view.
  2. For the "com.ibm.streamsx.json" toolkit, download the toolkit from the Github repository here: https://github.com/IBMStreams/streamsx.json. Instructions on compiling the toolkit can be found here: https://github.com/IBMStreams/streamsx.json/wiki. Once the toolkit is compiled, add it as a toolkit location to Streams Explorer.
  3. For the "com.ibm.streamsx.messaging" toolkit, a special version of the toolkit is needed in order to communicate with the Message Hub service on Bluemix. Instructions on how to download and install this toolkit can be found here (see the "Installing the messaging toolkit" section): https://developer.ibm.com/bluemix/2015/10/16/streaming-analytics-message-hub/. Once the toolkit has been compiled, add it as a toolkit location to Streams Explorer. 
3. At this point, all of the necessary toolkit dependencies should be available and the application should compile. The last step is to update the producer.properties and consumer.properties files, so that the Kafka operators can connect to the Message Hub. Using the MessageHub "server credentials" information you copied earlier, update the following properties in the etc/consumer.properties and the etc/producer.properties files:
  1. **bootstrap.servers** - set this value to the list of bootstrap servers found in the server credentials
		(e.g. bootstrap.servers=kafka01-prod01.messagehub.services.us-south.bluemix.net:9093,kafka02-prod01.messagehub.services.us-south.bluemix.net:9093)
  2. **client.id** - set this value to the API key value found in the server credentials
4. Right-click on the project and select "Build Active Configurations". This should build both the GPSSimulator and GeoAnalysisCloud applications. Make a note of the location of the *.sab files within the project: 
	- output/com.ibm.streamsx.insight.demo.GPSSimulator/Distributed/com.ibm.streamsx.insight.demo.GPSSimulator.sab
	- output/com.ibm.streamsx.insight.demo.GeoAnalysisCloud/Distributed/com.ibm.streamsx.insight.demo.GeoAnalysisCloud.sab
5. To deploy the applications, navigate to the Streams Console in Bluemix. Select the "Submit Job" button at the top (it has a triangle icon that looks a "play" button on a DVD player). Navigate to the location of one of the SAB files on the filesystem and submit the job. Repeat this step for both applications. 
  - NOTE: When launching the applications, you will need to specify submission-time parameters for the MQTT adapter operator. The values for these parameters were found in Step 1. 
6. At this point, the Streams applications should be running and generating results. Continue to next step to setup the web server and consume the results. 
	
##### Step 5: Create the Liberty for Java Web App on Bluemix
1. In the Bluemix Catalog, click on the Liberty for Java Runtime
2. Enter a name and host for the Runtime, then click CREATE (e.g. name="BluemixGeofenceApp")
3. Review the following documentation on how to  create apps with Liberty for Java: https://www.ng.bluemix.net/docs/#starters/liberty/index.html#liberty


##### Step 6: Download, Configure and Deploy the BluemixGeofenceWebApp

1. Download the code for the "BluemixGeofenceWebApp" application from here: https://github.com/cancilla/BluemixGeofenceDemo
2. In the com.ibm.streams.map/MapData.java file, update the following properties:
  1. update "BOOTSTRAP_SERVERS_CONFIG" property with a comma-separated list of the bootstrap servers
  2. update "CLIENT_ID_CONFIG" property with the API key
3. Compile the application using the 'build.xml' file
4. Deploy the application to Bluemix (see these instructions for deploying the application: https://www.ng.bluemix.net/docs/manageapps/eclipsetools/eclipsetools.html#eclipsetools)


