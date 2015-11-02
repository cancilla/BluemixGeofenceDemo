package com.ibm.streams.map;

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
