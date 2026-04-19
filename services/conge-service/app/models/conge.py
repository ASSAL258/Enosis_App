
class Conge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_id = models.UUIDField(db_index=True)
    type_dabbsence = models.ChoiceField(max_length=255, choices=[
        ('normale', 'NOERMALE'),
        ('maladie', 'Maladie'),
    ])
    start_date = models.DateField()
    end_date = models.DateField()
    motif = models.CharField(max_length=255)
    feedback_rh_id = models.UUIDField(null=True, blank=True, db_index=True)
    feedback_manager_id = models.UUIDField(null=True, blank=True, db_index=True)
    soldes_id = models.UUIDField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
        
    
 