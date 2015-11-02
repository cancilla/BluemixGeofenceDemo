package com.ibm.streams.map;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.Properties;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;

import org.apache.kafka.clients.CommonClientConfigs;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.config.SSLConfigs;
import org.apache.kafka.common.serialization.ByteArrayDeserializer;

@Path("/jax-rs/")
public class MapData {

	private static KafkaProducer<byte[], byte[]> producer = null;
	
	@POST
	@Path("updateFence")
	@Produces(MediaType.TEXT_PLAIN)
	public String updateFence(final String data) {
		String message = data + "\n";

		RecordMetadata metadata = null;
		try {
			if(producer == null)
			{
				producer = new KafkaProducer<byte[], byte[]>(getProperties());				
			}
			ProducerRecord<byte[], byte[]> record = new ProducerRecord<byte[], byte[]>(
					"fences", "records".getBytes("UTF-8"),
					message.getBytes("UTF-8"));
			metadata = producer.send(record).get();

			return "record added: " + metadata.toString();
		} catch (UnsupportedEncodingException | InterruptedException
				| ExecutionException e) {
			e.printStackTrace();
		} finally {
//			if (producer != null)
//				producer.close();
		}

		return "ERROR sending message!";
	}

	private static KafkaConsumer<byte[], byte[]> consumer = null;
	
	@GET
	@Path("getData")
	public String getMessageHubData() {
		try {
			if(consumer == null)
			{
				consumer = new KafkaConsumer<byte[], byte[]>(getProperties(),
						new ByteArrayDeserializer(), new ByteArrayDeserializer());

				ArrayList<String> topicList = new ArrayList<String>();
				topicList.add("demo");
				consumer.subscribe(topicList);				
			}
			Iterator<ConsumerRecord<byte[], byte[]>> it = consumer.poll(1000).iterator();
			while (it.hasNext()) {
				ConsumerRecord<byte[], byte[]> record = it.next();
				if (!it.hasNext()) {
					// this is the last record, so store that
					return new String(record.value(), Charset.forName("UTF-8"));
				}
			}
		} finally {
//			if (consumer != null) {
//				consumer.close();
//			}
		}

		return "No data!!";
	}

	private Properties getProperties() {
		Properties props = new Properties();
		try {
			props.load(new FileInputStream(new File("msghub.properties")));
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		// SSL Configs
		props.setProperty(SSLConfigs.SSL_PROTOCOL_CONFIG, "TLSv1.2");
		props.setProperty(SSLConfigs.SSL_ENABLED_PROTOCOLS_CONFIG, "TLSv1.2");
		props.setProperty(SSLConfigs.SSL_TRUSTSTORE_LOCATION_CONFIG,System.getProperty("java.home") + "/lib/security/cacerts");
		props.setProperty(SSLConfigs.SSL_TRUSTSTORE_PASSWORD_CONFIG, "changeit");
		props.setProperty(SSLConfigs.SSL_TRUSTSTORE_TYPE_CONFIG, "JKS");
		props.setProperty(SSLConfigs.SSL_ENDPOINT_IDENTIFICATION_ALGORITHM_CONFIG, "HTTPS");

		// Common Client Configs
		props.setProperty(CommonClientConfigs.SECURITY_PROTOCOL_CONFIG, "SSL");

		// Producer Configs
		props.setProperty(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.ByteArraySerializer");
		props.setProperty(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, "org.apache.kafka.common.serialization.ByteArraySerializer");
		props.setProperty(ProducerConfig.ACKS_CONFIG, "-1");

		// Consumer Configs
		props.setProperty("group.id", UUID.randomUUID().toString());
		
		return props;
	}

}
