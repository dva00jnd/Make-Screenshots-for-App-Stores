﻿// This script will save each localized image to a separate file and folder.
// Localization is based on the layer sets names.
#target photoshop

// known devices:
var device = {
    'iPhone 6 Plus': {width: 1242, height: 2208, quality: 8} ,   
    'iPhone 6': {width: 750, height: 1334, quality: 9},
    'iPhone 5': {width: 640, height: 1136, quality: 9},
    'iPhone 4': {width: 640, height: 960, quality: 10}, 
    'iPad':{width: 1536, height: 2048, quality: 9},
    'iPad Pro':{width: 2048, height: 2732, quality: 8},
    'As is': {width: 1, height: 1, quality: 9}
    }; 
var selectedDevices = []; // devices selected by USER

var knownLanguages = ['EN','RU','DE','FR','NL','ES']; // known languages
var fileLanguages = []; // languages exist in the current file
var selectedLanguages = []; // languages selected by USER

var dialogResult = "No result yet...";
var orientation = "Not clear yet...";// landscapte or portrait
var checkedDevice = [];
var checkedLanguage = [];  

///////////////////////////////////////////////////////////////////////////////
// Check image size and reverse height:
///////////////////////////////////////////////////////////////////////////////
function checkSize(){
    device['As is'].width = file.width;
    device['As is'].height = file.height;
    if (file.width > file.height) {
        orientation = "Landscapte";
        // TODO: swap height and width in var device
        for (var i in device){
            if(i != 'As is'){
                var tempHeight = device[i].width;
                device[i].width = device[i].height;
                device[i].height = tempHeight;
                }
            }
        }else{
            orientation = "Portrait"; // do nothing
            }
    }

///////////////////////////////////////////////////////////////////////////////
// Device and Language selection Dialog:
///////////////////////////////////////////////////////////////////////////////
function showDialog(fileLanguages){
    var dialog = new Window("dialog", "Screenshots to save");
    dialog.preferredSize.width = 300;
    dialog.orientation = 'column';
    //dialog.alignChildren = 'left';
    
    dialog.add("statictext", undefined, "Image: " + orientation + ", " + file.width.toString().match (/\d+/) + " x " + file.height.toString().match (/\d+/));
    
    // add checkboxes for devices:
    dialog.panelDevices = dialog.add("panel", undefined, "Select Devices:");
    dialog.panelDevices.alignment = 'fill';
    dialog.panelDevices.alignChildren = 'left';
    for (var i in device){
        checkedDevice[i] = dialog.panelDevices.add("checkbox", undefined, i);
        }    
    
    // add checkboxes for languages:
    dialog.panelLanguages = dialog.add("panel", undefined, "Select Languages:");
    dialog.panelLanguages.alignment = 'fill';
    dialog.panelLanguages.alignChildren = 'left';
    for (var i = 0; i < fileLanguages.length; i++){
        checkedLanguage[i] = dialog.panelLanguages.add("checkbox", undefined, fileLanguages[i]);
        checkedLanguage[i].value = true;
        }
    
    dialog.btnGroup = dialog.add("group"); 
    dialog.btnGroup.orientation = 'row';
    dialog.btnGroup.alignChildren = 'center';
    var btnCancel = dialog.btnGroup.add("button", undefined, "Cancel");
    var btnRun = dialog.btnGroup.add("button", undefined, "Run");
 
    btnRun.onClick = function() {// Let's go if Run clicked:
        // check selected devices:
        for (var i in device){
            // create list of selecled devices
            if (checkedDevice[i].value){
                selectedDevices.push (i);
                }
            }
        //alert (selectedDevices);
        // check selected laguages:
        for (var i in checkedLanguage){
            // create list of selected languages
            if (checkedLanguage[i].value){
                selectedLanguages.push (fileLanguages[i]);
                }
            }
        //alert (selectedLanguages);
        
        if (selectedDevices.length > 0 && selectedLanguages.length > 0){
            dialogResult = "OK";
            return dialog.close();
            } else{
                selectedDevices.length = 0;
                selectedDevices.length = 0;
                alert("Select Languages and Devices");
                }
        }
    btnCancel.onClick = function() {
        //Quit if Cancel clicked:
        dialogResult = "Canceled...";
        return dialog.close();
        }
    
    dialog.show();
    return dialogResult;
    }

///////////////////////////////////////////////////////////////////////////////
//Detect all the known languages from knownLanguages list, 
//create exist languages list - fileLanguages
///////////////////////////////////////////////////////////////////////////////
function detectLanguages(){    
    var layerSets = file.layerSets.length;
    var x = 0; // index for fileLanguages[] to skip non language layer sets
    //alert("Number of layer sets: " + layerSets);
    for (var i = 0; i < layerSets; i++){
        //alert(file.layerSets[i]);
        // check known languages:
        for (var j = 0; j < knownLanguages.length; j++){
            if (file.layerSets[i].name == knownLanguages[j]){
                fileLanguages[x] = file.layerSets[i].name; 
                x++;
                }
            }
        // TODO: detect language layerSets in layerSets:
        //if (file.layerSets[i].layerSets.length > 0) alert(file.layerSets[i] +" has "+ file.layerSets[i].layerSets.length +"layer sets");        
        }
    }

///////////////////////////////////////////////////////////////////////////////
// Create device folders (user defined devices):
///////////////////////////////////////////////////////////////////////////////
function makeDeviceFolders(){
    for (var i = 0; i < selectedDevices.length; i++){
        //alert (selectedDevices[i] + ": " + device[selectedDevices[i]].width + "x" + device[selectedDevices[i]].height);
        var deviceFolder = new Folder(file.path + "/" + selectedDevices[i] + "/");
        if(!deviceFolder.exists)  deviceFolder.create(); // create device folder
        makeLanguageFolders(selectedDevices[i]); // go make language folders inside
        }
    }

///////////////////////////////////////////////////////////////////////////////
// Create separate folders for each language (user dfined)
///////////////////////////////////////////////////////////////////////////////
function makeLanguageFolders(fileDeviceNeeded){
    for (var i = 0; i < selectedLanguages.length; i++){
        var languageFolder = new Folder(file.path + "/" + fileDeviceNeeded + "/" + selectedLanguages[i] + "/");
        if(!languageFolder.exists)  languageFolder.create(); // create language folder
        saveLocalizedImages(selectedLanguages[i], fileDeviceNeeded); // go save localized image inside
        }
    }

///////////////////////////////////////////////////////////////////////////////
// Save localized images to appropriate folders
///////////////////////////////////////////////////////////////////////////////
function saveLocalizedImages(fileLanguageNeeded, fileDeviceNeeded){
    for (var i = 0; i < fileLanguages.length; i++){
        file.layerSets.getByName(fileLanguages[i]).visible = false; // turn off all the language layer sets
        }
    file.layerSets.getByName(fileLanguageNeeded).visible = true; // turn on the necessary language layer sets    
    var saveToFile = new File (file.path + "/" + fileDeviceNeeded  + "/" + fileLanguageNeeded + "/" + fileName + ".jpg"); // file name and path 
    file.flatten();
    //set the appropriate size:
    file.resizeImage(device[fileDeviceNeeded].width, device[fileDeviceNeeded].height);
    var jpegOptions = new JPEGSaveOptions();
    jpegOptions.quality = device[fileDeviceNeeded].quality;
    file.saveAs (saveToFile, jpegOptions, true, Extension.LOWERCASE); // save a copy
    file.activeHistoryState = savedFileState; 
    }

///////////////////////////////////////////////////////////////////////////////
// Let's go!
///////////////////////////////////////////////////////////////////////////////
// Do we have a document open?:
if (app.documents.length > 0){
    // open documen variables:
    var savedFileState = app.activeDocument.activeHistoryState; // save the file state before processing!
    var file = app.activeDocument;
    var fileName =  file.name;
    fileName = fileName.replace(/\..+$/, ''); // cut the extension off
    
    // check file size and swap height and width if necessary:    
    checkSize();
    
    // Detect all the known languages in the file first:
    detectLanguages();
    
    // Show what we have. Should be replaced with dialog
    //alert ("Languages ("+ fileLanguages.length +"): " + fileLanguages);

    // Do we have known languages? 
    if (fileLanguages.length > 0){
        // Show dialog for USER input
        showDialog(fileLanguages);
        // Make folders for each device, then make folders for each language inside, then save files:
        if (dialogResult === "OK"){
            makeDeviceFolders();
            // revert to initial state:
            file.activeHistoryState = savedFileState; 
            // Show what we have done:
            //alert ("Done for: " + fileLanguages + "\n" + selectedLanguages);
            alert ("Done for:" + "\nLanguages: " + selectedLanguages + "\nDevices: " + selectedDevices);
            }
        }else{
            alert ("Can't find any language", "Error")
            }
    
    }else{
    alert ("You must have a document open.\nOpen a document and try again.", "Error")
    }


