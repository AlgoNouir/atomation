from django.core.management.base import BaseCommand 
from datetime import datetime, timedelta
from core.models import Log, ReportModel, GroupModel
import google.generativeai as genai
from django.utils.timezone import localtime
from time import sleep


def getLogs(group:GroupModel, logs_list:list[str], fromTime:datetime|None, toTime:datetime) -> list[str]:
    
    # ------------------------------------------------------------ GET LOGS
    print(fromTime, toTime)
    
    query = {
        "project__in": group.projects.all()
    }
    
    if fromTime is not None:
        query['timestamp__time__range'] = [fromTime, toTime],
    
    logs = Log.objects.filter(**query)
    
    txt = ""
    for log in logs:
        txt += str(log.timestamp)
        txt += str(log)
        txt += f"message: {log.message}"
        
    if txt == "":
        txt = f"report for not working of persons in team for {group.verbose} project"
        
    logs_list.append(txt)
    return logs_list


def connect2AI(group:GroupModel, txt:str):

    
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
    # for report in reports:
    #     temp_reports.append({
    #         "role": "user",
    #         "parts": [report.prompt]
    #     })
    #     temp_reports.append({
    #         "role": "model",
    #         "parts": [report.text]
    #     })
    
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
        
        
        now = localtime().hour
        groups = GroupModel.objects.filter(
            fromTime__gte=now,
            toTime__lt=now
            
        )
        
        print(groups)
        exit()
        
        while True:
            
            GroupModel.objects.filter(
                
            )
            
            # run for each groups
            for group in GroupModel.objects.all():
                logs_list = []
                times = getGroupReportTime(group)
                
                # check for time reporting
                if times is None:
                    print("not time for reporting")
                    continue
            
                fromTime, toTime = times
                logs_list = getLogs(group, logs_list, fromTime, toTime)
        
                connect2AI(
                    group=group,
                    txt='-------'.join(logs_list),
                )
        
            sleep(3600)