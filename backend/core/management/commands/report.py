from django.core.management.base import BaseCommand 
from datetime import datetime, timedelta
from core.models import Log, ReportModel
import google.generativeai as genai
import os



def connect2AI():

    # ------------------------------------------------------------ GET LOGS
    
    fromTime = datetime.now() - timedelta(hours=1)
    toTime = datetime.now() 

    logs = Log.objects.filter(
        timestamp__time__range=[fromTime, toTime]
    )
    
    txt = ""
    for log in logs:
        txt += str(log.timestamp)
        txt += str(log)
        txt += f"message: {log.message}"
        
    if txt == "":
        txt = "report for not working and empty logs"
    
    # ------------------------------------------------------------ GENERATE MODEL
    
    genai.configure(api_key="AIzaSyAa3q723QtRtmzNHGsmCxA6UP1KM91qR6w")

    # Create the model
    generation_config = {
        "temperature": 1,
        "top_p": 0.95,
        "top_k": 40,
        "max_output_tokens": 8192,
        "response_mime_type": "text/plain",
    }

    model = genai.GenerativeModel(
        model_name="gemini-2.0-flash-exp",
        generation_config=generation_config,
        system_instruction="Your name is Athena. Mehdi Nouri's private secretary. You receive all the reports from Mr. Nouri and put them in Telegram groups. You speak formally and briefly. You rewrite the messages better, but you don't change its meaning. You convert all reports into a few paragraphs of text, like you have to report to Mehdi Nouri and Amin Arian in a Telegram group. You tell all the reports carefully and in detail as if you are chatting in the group",
    )

    reports = ReportModel.objects.all()
    temp_reports = []
    for report in reports:
        temp_reports.append({
            "role": "user",
            "parts": [report.prompt]
        })
        temp_reports.append({
            "role": "model",
            "parts": [report.text]
        })
    
    chat_session = model.start_chat(
        history=temp_reports
    )
    
    response = chat_session.send_message(content=txt)

    # ------------------------------------------------------------ UPDATE REPORT

    report = ReportModel.objects.create(
        prompt=txt,
        text=response.text
    )
    



class Command(BaseCommand):

    def handle(self, *args, **options):
        connect2AI()