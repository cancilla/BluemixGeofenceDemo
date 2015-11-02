package com.ibm.streams.map;

import org.apache.log4j.Level;
import org.apache.log4j.Logger;

public class Test {

	public static void main(String[] args) {
		MapData data = new MapData();
		while(true)
		{
			String messageHubData = data.getMessageHubData();
			System.out.println(messageHubData);
			
		}
	}

}
