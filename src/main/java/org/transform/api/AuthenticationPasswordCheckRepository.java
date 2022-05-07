package org.transform.api;

import java.math.BigInteger;
import java.nio.charset.Charset;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Random;

import javax.xml.bind.DatatypeConverter;

import org.mule.api.MuleMessage;
import org.mule.api.transformer.TransformerException;
import org.mule.transformer.AbstractMessageTransformer;
import org.mule.util.CaseInsensitiveHashMap;

public class AuthenticationPasswordCheckRepository extends AbstractMessageTransformer{
	
	private static String inputPassword = null; 
	
	@Override
    public Object transformMessage(MuleMessage message, String outputEncoding) throws TransformerException {

		Object payload = message.getPayload();
		
		@SuppressWarnings("unchecked")
		LinkedList<Object> payloadList = (LinkedList<Object>) payload;	
		
		inputPassword = message.getInvocationProperty("inputPassword");
				
		try {
			return transformedValueMap((CaseInsensitiveHashMap) payloadList.get(0));
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}
		
		return payload;
    }
	
	public static Object transformedValueMap(CaseInsensitiveHashMap in) throws NoSuchAlgorithmException {

			boolean isMatched = givenPasswordVerifying((String) in.get("password"), inputPassword);
		
			Map<String, Object> map = new HashMap<>();
				
			map.put("username", in.get("username"));
			map.put("isMatched", isMatched);
			map.put("token", getMd5());
			
			return map;	
	}
	
	public static boolean givenPasswordVerifying(String hash, String password) throws NoSuchAlgorithmException {
			        
			   MessageDigest md = MessageDigest.getInstance("MD5");
			   md.update(password.getBytes());
			   byte[] digest = md.digest();
			   String phash = DatatypeConverter.printHexBinary(digest).toUpperCase();
			    
			   return phash.equals(hash) ? true : false;
	}
	
	public static String getMd5()
    {
		
		byte[] array = new byte[14]; // length is bounded by 7
	    new Random().nextBytes(array);
	    String generatedString = new String(array, Charset.forName("UTF-8"));
		
        try {
  
            // Static getInstance method is called with hashing MD5
            MessageDigest md = MessageDigest.getInstance("MD5");
  
            // digest() method is called to calculate message digest
            //  of an input digest() return array of byte
            byte[] messageDigest = md.digest(generatedString.getBytes());
  
            // Convert byte array into signum representation
            BigInteger no = new BigInteger(1, messageDigest);
  
            // Convert message digest into hex value
            String hashtext = no.toString(16);
            while (hashtext.length() < 32) {
                hashtext = "0" + hashtext;
            }
            return hashtext;
        } 
  
        // For specifying wrong message digest algorithms
        catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }
	
}
