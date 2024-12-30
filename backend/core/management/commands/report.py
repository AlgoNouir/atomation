from django.core.management.base import BaseCommand 
from datetime import datetime, timedelta
from core.models import Log, ReportModel, GroupModel
import google.generativeai as genai
from django.utils.timezone import localtime
from time import sleep



def connect2AI(group:GroupModel, fromTime:datetime, toTime:datetime):

    # ------------------------------------------------------------ GET LOGS
    
    logs = Log.objects.filter(
        timestamp__time__range=[fromTime, toTime],
        project__in=group.projects.all()
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
        system_instruction=group.systemMainPrompt,
    )

    reports = ReportModel.objects.filter(group_id=group.pk)
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
        text=response.text,
        group=group,
    )
    
    return report.text
    


def getGroupReportTime(group:GroupModel):
    
    lastReport = ReportModel.objects.filter(group_id=group.pk).order_by("-created_at").first()
    
    if lastReport is None:
        return None, localtime()
    
    nextReportTime = lastReport.created_at + timedelta(hours=group.repeetHour)
    
    # check time for reporting
    if localtime() < nextReportTime:
        return None
    
    # from last report time until now create report
    return lastReport.created_at, localtime()


class Command(BaseCommand):

    def handle(self, *args, **options):
        
        while True:
            # run for each groups
            for group in GroupModel.objects.all():
                times = getGroupReportTime(group)
                
                # check for time reporting
                if times is None:
                    print("not time for reporting")
                    return None
                
                fromTime, toTime = times
                connect2AI(
                    group=group,
                    fromTime=fromTime,
                    toTime=toTime,
                )
            
            sleep(3600)