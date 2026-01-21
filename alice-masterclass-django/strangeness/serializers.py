from rest_framework import serializers
from .models import VisualAnalysisResult, VisualAnalysisResultsEntry

class VisualAnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisualAnalysisResult
        fields = ['session', 'student', 'dataset']

class VisualAnalysisResultsEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = VisualAnalysisResultsEntry
        fields = ['eventid', 'particle', 'mass']
