## Download Signature File ##

### Method reference ###
dpi.downloadSF

#### message ####
Request:
	

	"contents": {
		"fileInfo": {
			"filePath" : "/SF/sf_20160721101112_01.kit",
			"protocol" : "FTP",
             "usename" : "admin",
             "password" : "password"
        }


Response: 

Config Succesfully:

    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }

Note:
Config Failure:

           "error":{
              "errorCode": -1,
              "eroorMessage": "File Not Found"
           } 


## Reload Signature File ##

### Method reference ###
dpi.downloadSF

#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.clearAndReload",
	"action":"post"，
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
        
      }
}

Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.clearAndReload",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.clearAndReload",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}

## Create APP Mon Group ##
### Method reference ###
dpi.appGroup
#### message ####

Request:
{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
 	"action": "post",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
        "avAppMonGroupConfigObject":{
		"appGroup":""appgroup",
 		"appGroupInsertList":[{"apps":[{"appId":1,"appName":"appname1"}],"groupName":"groupname1"}],
		"appGroupModifyList":[{"apps":[{"appId":3,"appName":"appname3"}],"groupName":"groupname3"}],
		"appGroupRemoveList":[{"apps":[{"appId":2,"appName":"appname2"}],"groupName":"groupname2"}]
        }
	}

}


Response:

Config Succesfully:
{
    
	"version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{
	
	"version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}

## Create APP Mon APP List ##
### Method reference ###
dpi.appMon_appList
#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": ""dpi.appMon_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
		"action":"post",
		"avAppMonAppListConfigObject":{
		"appGroup":"appGroup",
		"appGroupInsertList":[{"apps":[{"appId":4,"appName":"appname4"}],"groupName":"groupname4"}],
		"appGroupRemoveList":[{"apps":[{"appId":5,"appName":"appname5"],"groupName":"groupname5"}],
		"appInsertList":[{"appId":1,"appName":""appname1"}],
		"appRemoveList":[{"appId":2,"appName":"appname2"}],
 		"listType":"listType"
		}
	}
}

Response:

"Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}



## Create DPI APP List ##
### Method reference ###
dpi.dpi_appList

#### message ####
Request:
{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.dpi_appList",
	"action":""post",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
        "avAppMonAppListConfigObject":{
		"appGroup":"appGroup",
		"appGroupInsertList":[{"apps":[{"appId":4,"appName":"appname4"}],"groupName":"groupname4"}],
 		"appGroupRemoveList":[{"apps":[{"appId":5,"appName":"appname5"}],"groupName":"groupname5"}],
		"appInsertList":[{"appId":1,"appName":"appname1"}],
 		"appRemoveList":[{"appId":2,"appName":"appname2"}],
 		"listType":"listType"
		}

	}
}"


Response:

"Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.dpi_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.dpi_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}



## Active APP List ##
### Method reference ###
dpi.active_appList
#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.active_appList",
	"action":"post"
    "macAddress": "00-50-56-C0-00-01",
    "contents": {

     }
}


Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.active_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.active_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}


## Enable APP Mon Gloablly ##
### Method reference ###
dpi.enable_appMon
#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.enable_appMon",
	"action":"post"，
    "macAddress": "00-50-56-C0-00-01",
    "contents": {

     }
}



Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.enable_appMon",
    "macAddress": ""00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.enable_appMon",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}


## Modify APP Groups ##
### Method reference ###
dpi.appGroup
#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
    "macAddress": "00-50-56-C0-00-01",
	"action":"put",
    "contents": {
		"avAppMonGroupConfigObject": {     
		"appGroup":"appgroup",
 		"appGroupInsertList":[{"apps":[{"appId":1,"appName":"appname1"}],"groupName":"groupname1"}],
		"appGroupModifyList":[{"apps":[{"appId":3,"appName":"appname3"}],"groupName":"groupname3"}],
 		"appGroupRemoveList":[{"apps":[{"appId":2,"appName":"appname2"}],"groupName":"groupname2"}]
		}
	}
}


Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result"": {},
           "error"":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}


## Remove APP Groups ##
### Method reference ###
dpi.appGroup
#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
	"action":"put",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
		"avAppMonGroupConfigObject": { 
		"appGroup":"appgroup",
		"appGroupInsertList":[{"apps":[{"appId":1,"appName":"appname1"}],"groupName":"groupname1"}],
 		"appGroupModifyList":[{"apps":[{"appId":3,"appName":"appname3"}],"groupName":"groupname3"}],
		"appGroupRemoveList":[{"apps":[{"appId":2,"appName":"appname2"}],"groupName":"groupname2"}]

		}
	}
}

Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appGroup",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}


## Modify APP List ##
### Method reference ###
dpi.appMon_appList
#### message ####
Request:
{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
	"action":"put",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
		"avAppMonAppListConfigObject":{
			"appGroup":"appGroup",
			"appGroupInsertList":[{"apps":[{"appId":4,"appName":"appname4"}],"groupName":"groupname4"}],
 			"appGroupRemoveList":[{"apps":[{"appId":5,"appName":"appname5"}],"groupName":"groupname5"}],
			"appInsertList":[{"appId":1,"appName":""appname1""}],
 			"appRemoveList":[{"appId":2,"appName":"appname2"}],
 			"listType"":"listType"
		}
	}
}



Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}



## Unassign Profile ##
### Method reference ###
dpi.appMon_appList

#### message ####
{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
	"action":"post"",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
		"avAppMonAppListConfigObject":{
		"appGroup":"appGroup",
 		"appGroupInsertList":[{"apps":[{"appId":4,"appName":"appname4"}],"groupName":"groupname4"}],
		"appGroupRemoveList":[{"apps":[{"appId":5,"appName":"appname5"}],"groupName":"groupname5"}],
		"appInsertList":[{"appId":1,"appName":"appname1"}],
		"appRemoveList":[{"appId":2,"appName":"appname2"}],
		"listType":"listType"
		}
	}
}



Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {},
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method"": "dpi.appMon_appList",
    "macAddress": ""00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}


## Read active Sig File Version ##
### Method reference ###
dpi.sig_version
#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.sig_version",
	"action":"get"
    "macAddress": "00-50-56-C0-00-01",
    "contents": {

      }
}



Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method"": "dpi.sig_version",
    "macAddress": "00-50-56-C0-00-01",
	"contents"": {
		"success": true,
		"result": {
			"avApSigVersions":[{
				"apId":{"apIp":"apid1","apMac":""apmac1","vmaSvcId":"vmasvcid1"},
				"version":"version"}]
                
            },
		"error":{
			"errorCode": 0,
			"eroorMessage": ""
		} 
	}
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.sig_version",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }

}


## DPI appMon_appList ##
### Method reference ###
dpi.appMon_appList
#### message ####
Request:
{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
	"action":"get"
    "macAddress": "00-50-56-C0-00-01",
    "contents": {

      }
}


Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appMon_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
		"success": true,
		"result": {
			"avApAppList":[
				 {
				  "apId":{"apIp":"apid2","apMac":"apmac2","vmaSvcId":"vmasvcid2"},
				  "appList":{
				   "appGroups":[{"apps":[{"appId":6,"appName"":"appname6"}],"groupName":"groupname6"}],
				   "apps":[{"appId":7,"appName":"appname7"}],
				   "listType":"listtype1"}
				 }
			]
                
		},
		"error":{
			"errorCode": 0,
			"eroorMessage": ""
		} 
	}
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method"": "dpi.appMon_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}


## Read DPI app list ##
### Method reference ###
dpi.dpi_appList
#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.dpi_appList",
	"action":"get",
    "macAddress": "00-50-56-C0-00-01",
    "contents"": {

      }
}

Response:

"Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method"": "dpi.dpi_appList"",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
		"success": true,
		"result": {
			"avApAppList":[{
				  "apId":{"apIp":"apid2","apMac":"apmac2","vmaSvcId":"vmasvcid2"},
				  "appList":{"appGroups":
						[{"apps":[{"appId":6,"appName"appname6"}],"groupName":"groupname6"}],
				   		  "apps":[{"appId":7,"appName":"appname7"}],
				          "listType":"listtype1"}}]},
		"error":{
			"errorCode": 0,
			"eroorMessage": ""
		} 
	}
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.dpi_appList",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage"": "AP Internal Error"
           } 
     }
}



## App Mon Stats ##
### Method reference ###
dpi.appMon_stats

#### message ####
Request:

{

    "version": "v1.0",
    "messageID": 12345567893,
    "sessionID": 11111111113,
    "method": "dpi.appMon_stats",
	"action":"get"
    "macAddress": "00-50-56-C0-00-01",
    "contents": {

      }
}

Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appMon_stats",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
		"success": true,
		"result": {
			"avApAppMonStats":[{
			  "apId":{"apIp":"apid3",apMac":"apmac3",vmaSvcId":"vmasvcid3"},
			  "appMonStatsLis[{"appName":"appname","groupName":"groupname","totalFlow":1,"utcInterval":1469700185118}]}]},
		"error":{
			"errorCode": 0,
			"eroorMessage": ""
		} 
	}
}

Config Failure:
{
    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.appMon_stats",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}





## DPI dpi_stats ##
### Method reference ###
dpi.dpi_stats
#### message ####
Request:
{

    "version"": "v1.0",
    "messageID"": 12345567893,
    "sessionID": 11111111113,
    "method"": "dpi.dpi_stats",
	"action":"get"，
    "macAddress"": "00-50-56-C0-00-01",
    "contents"": {

      }
}


Response:

Config Succesfully:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.dpi_stats",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": true,
           "result": {
                "avFileObjects": {
                    "apOrGroupId":1,
                    "fileCheckSum":"filechecksum",
                    "idType":"idtype"
                 }
            },
           "error":{
              "errorCode": 0,
              "eroorMessage": ""
           } 
     }
}

Config Failure:
{

    "version": "v1.0",
    "messageID": 12345567894,
    "sessionID": 11111111113,
    "method": "dpi.dpi_stats",
    "macAddress": "00-50-56-C0-00-01",
    "contents": {
           "success": false,
           "result": {},
           "error":{
              "errorCode": -1,
              "eroorMessage": "AP Internal Error"
           } 
     }
}















