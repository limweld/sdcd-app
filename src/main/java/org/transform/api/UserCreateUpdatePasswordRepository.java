package org.transform.api;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import javax.xml.bind.DatatypeConverter;

import org.mule.api.MuleMessage;
import org.mule.api.transformer.TransformerException;
import org.mule.transformer.AbstractMessageTransformer;

public class UserCreateUpdatePasswordRepository extends AbstractMessageTransformer{

	@Override
    public Object transformMessage(MuleMessage message, String outputEncoding) throws TransformerException {

		Object payload = message.getPayload();
		
		try {
			return transformedValueMap( payload);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		
		return payload;
    }
	
	public static Object transformedValueMap(Object in) throws NoSuchAlgorithmException {

		@SuppressWarnings("unchecked")
		HashMap<String,String> entryMap = (HashMap<String, String>) in;
		
		Map<String, String> newMap = new HashMap<>();
		
		for(@SuppressWarnings("rawtypes") Map.Entry m : entryMap.entrySet()){    
			
			String keyMap = m.getKey().toString();
			String valueMap = m.getValue().toString();
			
			newMap.put(keyMap, keyMap == "password" ? hashingPassword(valueMap): valueMap);
			
		} 
		
		return newMap;	

	}	
	
	private static String hashingPassword( String password ) throws NoSuchAlgorithmException {
		    
		MessageDigest md = MessageDigest.getInstance("MD5");
		
		md.update(password.getBytes());
		
		byte[] digest = md.digest();
		
		String hash = DatatypeConverter.printHexBinary(digest).toUpperCase();
		    
		return hash;
	}

}
